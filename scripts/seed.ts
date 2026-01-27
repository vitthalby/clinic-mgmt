
import { config } from "dotenv";
config({ path: ".env.local" });

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { roles, users } from "../lib/schema";
import { eq, and, isNull } from "drizzle-orm";

async function main() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) throw new Error("DATABASE_URL is not set");

    console.log("1. Connecting to database...");
    const client = postgres(connectionString, { max: 1 });
    const db = drizzle(client);

    try {
        console.log("2. Seeding ADMIN Role (global/system role with no branch)...");
        const adminRoleName = process.env.ADMIN_ROLE || "ADMIN";

        // Check if ADMIN role exists (with no branch - global role)
        const existingAdminRole = await db.select().from(roles)
            .where(and(
                eq(roles.name, adminRoleName),
                isNull(roles.branchId)
            ));

        if (existingAdminRole.length === 0) {
            console.log(`   Creating global role: ${adminRoleName}`);
            await db.insert(roles).values({
                name: adminRoleName,
                branchId: null, // Global/system role
                description: "System Administrator - Full Access to All Branches",
            });
        } else {
            console.log(`   Global role ${adminRoleName} exists.`);
        }

        console.log("3. Seeding Admin User...");
        const targetEmail = "vitthalby@gmail.com";

        const existingUser = await db.select().from(users).where(eq(users.email, targetEmail));
        if (existingUser.length > 0) {
            console.log(`   Updating existing user ${targetEmail} to ${adminRoleName}...`);
            await db.update(users)
                .set({ role: adminRoleName })
                .where(eq(users.email, targetEmail));
        } else {
            console.log(`   Creating new user ${targetEmail} as ${adminRoleName}...`);
            await db.insert(users).values({
                email: targetEmail,
                role: adminRoleName,
                name: "System Admin",
            });
        }

        // Note: ADMIN users don't need entries in userBranchRoles
        // Their role is stored directly in users.role field
        // userBranchRoles is only for non-admin users with branch-specific roles

        console.log("4. Seed completed successfully.");

    } catch (e) {
        console.error("SEED API ERROR:", e);
    } finally {
        await client.end();
    }
}

main().catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
});
