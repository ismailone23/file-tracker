import {
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", [
  "RECEPTION",
  "OFFICER",
  "MANAGER",
  "RECORDS_ADMIN",
]);

export const stageEnum = pgEnum("stage", [
  "reception",
  "officer",
  "manager",
  "final",
]);

export const fileStatusEnum = pgEnum("file_status", [
  "Pending",
  "Approved",
  "Forwarded",
]);

export const workflowActionTypeEnum = pgEnum("workflow_action_type", [
  "approved-forwarded",
  "forwarded",
]);

export const usersTable = pgTable(
  "users",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    role: roleEnum("role").notNull(),
    allowedStages: stageEnum("allowed_stages").array().notNull(),
    passwordHash: text("password_hash").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    emailUnique: uniqueIndex("users_email_unique").on(table.email),
  }),
);

export const fileRecordsTable = pgTable(
  "file_records",
  {
    id: text("id").primaryKey(),
    externalId: text("external_id").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    currentStage: stageEnum("current_stage").notNull(),
    assignedTo: text("assigned_to").notNull(),
    status: fileStatusEnum("status").notNull().default("Pending"),
    createdById: text("created_by_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    externalIdUnique: uniqueIndex("file_records_external_id_unique").on(table.externalId),
  }),
);

export const workflowActionsTable = pgTable("workflow_actions", {
  id: text("id").primaryKey(),
  fileId: text("file_id")
    .notNull()
    .references(() => fileRecordsTable.id, { onDelete: "cascade" }),
  byUserId: text("by_user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "restrict" }),
  type: workflowActionTypeEnum("type").notNull(),
  fromStage: stageEnum("from_stage").notNull(),
  toStage: stageEnum("to_stage").notNull(),
  note: text("note"),
  signature: text("signature"),
  timestamp: timestamp("timestamp", { withTimezone: true }).defaultNow().notNull(),
});

export const auditLogsTable = pgTable("audit_logs", {
  id: text("id").primaryKey(),
  actorId: text("actor_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "restrict" }),
  event: text("event").notNull(),
  entity: text("entity").notNull(),
  entityId: text("entity_id").notNull(),
  meta: jsonb("meta"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Role = (typeof roleEnum.enumValues)[number];
export type Stage = (typeof stageEnum.enumValues)[number];
export type FileStatus = (typeof fileStatusEnum.enumValues)[number];
export type WorkflowActionType = (typeof workflowActionTypeEnum.enumValues)[number];
