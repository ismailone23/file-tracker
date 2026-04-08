import { serve } from "@hono/node-server";
import { createNodeWebSocket } from "@hono/node-ws";
import { db, schema } from "@file-tracker/db";
import type {
  FileStatus,
  Role,
  Stage,
  WorkflowActionType,
} from "@file-tracker/db";
import { and, asc, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { Hono } from "hono";
import type { Context } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { env } from "./env.js";
import {
  type SessionClaims,
  signAccessToken,
  verifyAccessToken,
  verifyPassword,
} from "./auth.js";
import { publishEvent, subscribe } from "./realtime.js";

const { usersTable, fileRecordsTable, workflowActionsTable, auditLogsTable } =
  schema;

type AppVariables = {
  session: SessionClaims;
};

const app = new Hono<{ Variables: AppVariables }>();
const { upgradeWebSocket, injectWebSocket } = createNodeWebSocket({ app });

app.use("*", cors({ origin: env.CORS_ORIGIN, credentials: true }));

const STAGE_FLOW: Stage[] = ["reception", "officer", "manager", "final"];

function makeId() {
  return crypto.randomUUID();
}

function getNextStage(stage: Stage) {
  const idx = STAGE_FLOW.indexOf(stage);
  if (idx < 0 || idx === STAGE_FLOW.length - 1) {
    return null;
  }

  return STAGE_FLOW[idx + 1];
}

function roleAllowsStage(session: SessionClaims, stage: Stage) {
  if (session.role === "RECORDS_ADMIN") {
    return true;
  }

  return session.allowedStages.includes(stage);
}

function serializeFiles(
  files: Array<{
    id: string;
    externalId: string;
    title: string;
    description: string;
    currentStage: Stage;
    assignedTo: string;
    status: FileStatus;
  }>,
  actionsByFileId: Record<
    string,
    Array<{
      id: string;
      type: WorkflowActionType;
      by: string;
      timestamp: Date;
      fromStage: Stage;
      toStage: Stage;
      note: string | null;
      signature: string | null;
    }>
  >,
) {
  return files.map((file) => ({
    id: file.externalId,
    title: file.title,
    description: file.description,
    currentStage: file.currentStage,
    assignedTo: file.assignedTo,
    status: file.status,
    history: (actionsByFileId[file.id] ?? []).map((action) => ({
      id: action.id,
      type: action.type,
      by: action.by,
      timestamp: action.timestamp.toISOString(),
      fromStage: action.fromStage,
      toStage: action.toStage,
      note: action.note ?? undefined,
      signature: action.signature ?? undefined,
    })),
  }));
}

async function fetchActionsByFileIds(fileIds: string[]) {
  if (fileIds.length === 0) {
    return {};
  }

  const rows = await db
    .select({
      fileId: workflowActionsTable.fileId,
      id: workflowActionsTable.id,
      type: workflowActionsTable.type,
      fromStage: workflowActionsTable.fromStage,
      toStage: workflowActionsTable.toStage,
      note: workflowActionsTable.note,
      signature: workflowActionsTable.signature,
      timestamp: workflowActionsTable.timestamp,
      by: usersTable.name,
    })
    .from(workflowActionsTable)
    .innerJoin(usersTable, eq(workflowActionsTable.byUserId, usersTable.id))
    .where(inArray(workflowActionsTable.fileId, fileIds))
    .orderBy(asc(workflowActionsTable.timestamp));

  return rows.reduce<
    Record<
      string,
      Array<{
        id: string;
        type: WorkflowActionType;
        by: string;
        timestamp: Date;
        fromStage: Stage;
        toStage: Stage;
        note: string | null;
        signature: string | null;
      }>
    >
  >((acc, row) => {
    if (!acc[row.fileId]) {
      acc[row.fileId] = [];
    }

    acc[row.fileId].push({
      id: row.id,
      type: row.type,
      by: row.by,
      timestamp: row.timestamp,
      fromStage: row.fromStage,
      toStage: row.toStage,
      note: row.note,
      signature: row.signature,
    });

    return acc;
  }, {});
}

async function authGuard(c: Context<{ Variables: AppVariables }>) {
  const auth = c.req.header("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;

  if (!token) {
    throw new HTTPException(401, { message: "Missing bearer token." });
  }

  const payload = await verifyAccessToken(token).catch(() => null);
  if (!payload) {
    throw new HTTPException(401, { message: "Invalid token." });
  }

  c.set("session", {
    sub: payload.sub,
    name: payload.name,
    email: payload.email,
    role: payload.role,
    allowedStages: payload.allowedStages,
  });
}

app.post("/auth/login", async (c) => {
  const body = await c.req.json();
  const email = String(body?.email ?? "")
    .trim()
    .toLowerCase();
  const password = String(body?.password ?? "");

  if (!email || !password) {
    throw new HTTPException(400, {
      message: "Email and password are required.",
    });
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  if (!user) {
    throw new HTTPException(401, { message: "Invalid credentials." });
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    throw new HTTPException(401, { message: "Invalid credentials." });
  }

  const token = await signAccessToken({
    sub: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    allowedStages: user.allowedStages,
  });

  return c.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      allowedStages: user.allowedStages,
    },
  });
});

app.get("/officers", async (c) => {
  const users = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      role: usersTable.role,
      allowedStages: usersTable.allowedStages,
    })
    .from(usersTable)
    .orderBy(asc(usersTable.createdAt));

  return c.json({ users });
});

app.use("/files/*", async (c, next) => {
  await authGuard(c);
  await next();
});

app.use("/audit-logs", async (c, next) => {
  await authGuard(c);
  await next();
});

app.use("/reports/*", async (c, next) => {
  await authGuard(c);
  await next();
});

app.get("/files", async (c) => {
  const session = c.get("session");
  const stageParam = c.req.query("stage");
  const search = c.req.query("search")?.trim();

  const filters = [];

  if (stageParam) {
    const stage = stageParam as Stage;
    if (!STAGE_FLOW.includes(stage)) {
      throw new HTTPException(400, { message: "Invalid stage." });
    }

    if (!roleAllowsStage(session, stage)) {
      throw new HTTPException(403, { message: "Not allowed for this stage." });
    }

    filters.push(eq(fileRecordsTable.currentStage, stage));
  }

  if (search) {
    filters.push(
      or(
        ilike(fileRecordsTable.externalId, `%${search}%`),
        ilike(fileRecordsTable.title, `%${search}%`),
        ilike(fileRecordsTable.description, `%${search}%`),
        ilike(fileRecordsTable.assignedTo, `%${search}%`),
      )!,
    );
  }

  const whereClause = filters.length > 0 ? and(...filters) : undefined;

  const files = await db
    .select({
      id: fileRecordsTable.id,
      externalId: fileRecordsTable.externalId,
      title: fileRecordsTable.title,
      description: fileRecordsTable.description,
      currentStage: fileRecordsTable.currentStage,
      assignedTo: fileRecordsTable.assignedTo,
      status: fileRecordsTable.status,
    })
    .from(fileRecordsTable)
    .where(whereClause)
    .orderBy(desc(fileRecordsTable.updatedAt));

  const actionsByFileId = await fetchActionsByFileIds(
    files.map((file) => file.id),
  );
  return c.json({ files: serializeFiles(files, actionsByFileId) });
});

app.post("/files", async (c) => {
  const session = c.get("session");
  const body = await c.req.json();

  const title = String(body?.title ?? "").trim();
  const description = String(body?.description ?? "").trim();
  const stage = String(body?.stage ?? "") as Stage;
  const assignedTo =
    String(body?.assignedTo ?? "Unassigned").trim() || "Unassigned";

  if (!title || !description || !STAGE_FLOW.includes(stage)) {
    throw new HTTPException(400, { message: "Invalid payload." });
  }

  if (!roleAllowsStage(session, stage)) {
    throw new HTTPException(403, {
      message: "Not allowed to create in this stage.",
    });
  }

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(fileRecordsTable);

  const year = new Date().getFullYear();
  const sequence = String(Number(count) + 1).padStart(3, "0");
  const externalId = `FT-${year}-${sequence}`;

  const [inserted] = await db
    .insert(fileRecordsTable)
    .values({
      id: makeId(),
      externalId,
      title,
      description,
      currentStage: stage,
      assignedTo,
      status: "Pending",
      createdById: session.sub,
    })
    .returning();

  await db.insert(auditLogsTable).values({
    id: makeId(),
    actorId: session.sub,
    event: "FILE_CREATED",
    entity: "FileRecord",
    entityId: inserted.id,
    meta: { externalId, stage },
  });

  const serialized = serializeFiles([inserted], {})[0];
  publishEvent({ type: "file.created", payload: serialized });

  return c.json({ file: serialized }, 201);
});

app.post("/files/:externalId/forward", async (c) => {
  const session = c.get("session");
  const { externalId } = c.req.param();
  const body = await c.req.json();

  const actionType = String(
    body?.actionType ?? "forwarded",
  ) as WorkflowActionType;
  const note = body?.note ? String(body.note) : undefined;
  const signature = body?.signature ? String(body.signature) : undefined;

  if (actionType !== "approved-forwarded" && actionType !== "forwarded") {
    throw new HTTPException(400, { message: "Invalid action type." });
  }

  const [file] = await db
    .select()
    .from(fileRecordsTable)
    .where(eq(fileRecordsTable.externalId, externalId))
    .limit(1);

  if (!file) {
    throw new HTTPException(404, { message: "File not found." });
  }

  if (!roleAllowsStage(session, file.currentStage)) {
    throw new HTTPException(403, {
      message: "Not allowed to transition this stage.",
    });
  }

  const nextStage = getNextStage(file.currentStage);
  if (!nextStage) {
    throw new HTTPException(400, {
      message: "Final stage cannot be forwarded.",
    });
  }

  if (actionType === "approved-forwarded" && !signature) {
    throw new HTTPException(400, {
      message: "Signature is required for approve-and-forward.",
    });
  }

  const [updated] = await db
    .update(fileRecordsTable)
    .set({
      currentStage: nextStage,
      assignedTo: "Unassigned",
      status: actionType === "approved-forwarded" ? "Approved" : "Forwarded",
      updatedAt: new Date(),
    })
    .where(eq(fileRecordsTable.id, file.id))
    .returning();

  await db.insert(workflowActionsTable).values({
    id: makeId(),
    fileId: file.id,
    byUserId: session.sub,
    type: actionType,
    fromStage: file.currentStage,
    toStage: nextStage,
    note,
    signature,
  });

  await db.insert(auditLogsTable).values({
    id: makeId(),
    actorId: session.sub,
    event: "FILE_TRANSITIONED",
    entity: "FileRecord",
    entityId: file.id,
    meta: {
      externalId,
      fromStage: file.currentStage,
      toStage: nextStage,
      actionType,
    },
  });

  const actionsByFileId = await fetchActionsByFileIds([file.id]);
  const serialized = serializeFiles([updated], actionsByFileId)[0];

  publishEvent({ type: "file.transitioned", payload: serialized });

  return c.json({ file: serialized });
});

app.get("/audit-logs", async (c) => {
  const session = c.get("session");
  if (
    session.role !== ("RECORDS_ADMIN" as Role) &&
    session.role !== ("MANAGER" as Role)
  ) {
    throw new HTTPException(403, {
      message: "Insufficient role to view audit logs.",
    });
  }

  const limit = Number(c.req.query("limit") ?? 50);

  const rows = await db
    .select({
      id: auditLogsTable.id,
      event: auditLogsTable.event,
      entity: auditLogsTable.entity,
      entityId: auditLogsTable.entityId,
      meta: auditLogsTable.meta,
      createdAt: auditLogsTable.createdAt,
      actorName: usersTable.name,
      actorEmail: usersTable.email,
      actorRole: usersTable.role,
    })
    .from(auditLogsTable)
    .innerJoin(usersTable, eq(auditLogsTable.actorId, usersTable.id))
    .orderBy(desc(auditLogsTable.createdAt))
    .limit(Math.min(Math.max(limit, 1), 200));

  return c.json({
    logs: rows.map((row) => ({
      id: row.id,
      event: row.event,
      entity: row.entity,
      entityId: row.entityId,
      meta: row.meta,
      createdAt: row.createdAt.toISOString(),
      actor: {
        name: row.actorName,
        email: row.actorEmail,
        role: row.actorRole,
      },
    })),
  });
});

app.get("/reports/stage-distribution", async (c) => {
  const _session = c.get("session");

  const grouped = await db
    .select({
      stage: fileRecordsTable.currentStage,
      count: sql<number>`count(*)`,
    })
    .from(fileRecordsTable)
    .groupBy(fileRecordsTable.currentStage);

  return c.json({
    distribution: grouped.map((row) => ({
      stage: row.stage,
      count: Number(row.count),
    })),
  });
});

app.get(
  "/ws",
  upgradeWebSocket(() => {
    return {
      onOpen(_event, ws) {
        const unsubscribe = subscribe((evt) => {
          ws.send(JSON.stringify(evt));
        });

        ws.raw.addEventListener("close", () => unsubscribe());
        ws.send(
          JSON.stringify({
            type: "system.ready",
            payload: { connectedAt: new Date().toISOString() },
          }),
        );
      },
    };
  }),
);

const server = serve(
  {
    fetch: app.fetch,
    port: env.PORT,
  },
  (info) => {
    console.log(`API running on http://localhost:${info.port}`);
  },
);

injectWebSocket(server);
