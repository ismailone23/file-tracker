import "dotenv/config";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "./index.js";
import { fileRecordsTable, usersTable } from "./schema.js";

const DEFAULT_PASSWORD = process.env.DEMO_USER_PASSWORD ?? "ChangeMe123!";

function makeId() {
  return crypto.randomUUID();
}

async function main() {
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  const seedUsers = [
    {
      id: makeId(),
      name: "Amina Yusuf",
      email: "amina@filetracker.local",
      role: "RECEPTION" as const,
      allowedStages: ["reception"] as const,
      passwordHash,
    },
    {
      id: makeId(),
      name: "Rahul Sen",
      email: "rahul@filetracker.local",
      role: "OFFICER" as const,
      allowedStages: ["officer"] as const,
      passwordHash,
    },
    {
      id: makeId(),
      name: "Marta Klein",
      email: "marta@filetracker.local",
      role: "MANAGER" as const,
      allowedStages: ["manager"] as const,
      passwordHash,
    },
    {
      id: makeId(),
      name: "Noah Ibrahim",
      email: "noah@filetracker.local",
      role: "RECORDS_ADMIN" as const,
      allowedStages: ["final"] as const,
      passwordHash,
    },
  ];

  for (const user of seedUsers) {
    await db
      .insert(usersTable)
      .values(user)
      .onConflictDoUpdate({
        target: usersTable.email,
        set: {
          name: user.name,
          role: user.role,
          allowedStages: [...user.allowedStages],
          passwordHash,
          updatedAt: new Date(),
        },
      });
  }

  const [receptionist] = await db
    .select({ id: usersTable.id, name: usersTable.name })
    .from(usersTable)
    .where(eq(usersTable.email, "amina@filetracker.local"))
    .limit(1);

  if (!receptionist) {
    throw new Error("Receptionist seed user not found.");
  }

  const [existing] = await db
    .select({ id: fileRecordsTable.id })
    .from(fileRecordsTable)
    .where(eq(fileRecordsTable.externalId, `FT-${new Date().getFullYear()}-001`))
    .limit(1);

  if (!existing) {
    await db.insert(fileRecordsTable).values({
      id: makeId(),
      externalId: `FT-${new Date().getFullYear()}-001`,
      title: "Land Permit - Plot 24A",
      description: "Verification and routing for municipal land permit release.",
      currentStage: "reception",
      assignedTo: receptionist.name,
      status: "Pending",
      createdById: receptionist.id,
    });
  }

  console.log("Drizzle seed completed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
