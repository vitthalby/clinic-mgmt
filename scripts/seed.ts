
import { config } from "dotenv";
config({ path: ".env.local" });

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { roles, users, userRoles } from "../lib/schema";
import { eq, and } from "drizzle-orm";

async function main() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) throw new Error("DATABASE_URL is not set");

    console.log("1. Connecting to database...");
    const client = postgres(connectionString, { max: 1 });
    const db = drizzle(client);

    try {
        console.log("2. Seeding Roles...");
        const roleNames = ["ADMIN"];
        for (const name of roleNames) {
            const existing = await db.select().from(roles).where(eq(roles.name, name));
            if (existing.length === 0) {
                console.log(`   Creating role: ${name}`);
                await db.insert(roles).values({
                    name: name,
                    description: "System Administrator",
                });
            } else {
                console.log(`   Role ${name} exists.`);
            }
        }

        console.log("3. Seeding User...");
        const targetEmail = "vitthalby@gmail.com";
        let userId = null;

        const existingUser = await db.select().from(users).where(eq(users.email, targetEmail));
        if (existingUser.length > 0) {
            console.log(`   Updating existing user ${targetEmail} to ADMIN...`);
            await db.update(users)
                .set({ role: "ADMIN" })
                .where(eq(users.email, targetEmail));
            userId = existingUser[0].id;
        } else {
            console.log(`   Creating new user ${targetEmail} as ADMIN...`);
            const [newUser] = await db.insert(users).values({
                email: targetEmail,
                role: "ADMIN",
                name: "System Admin",
            }).returning();
            userId = newUser.id;
        }

        console.log("4. Mapping User to Role...");
        if (userId) {
            const [adminRole] = await db.select().from(roles).where(eq(roles.name, "ADMIN"));
            if (adminRole) {
                const existingMapping = await db.select().from(userRoles)
                    .where(and(
                        eq(userRoles.userId, userId),
                        eq(userRoles.roleId, adminRole.id)
                    ));

                if (existingMapping.length === 0) {
                    console.log(`   Inserting into user_roles (User: ${userId}, Role: ${adminRole.id})...`);
                    await db.insert(userRoles).values({
                        userId: userId,
                        roleId: adminRole.id
                    });
                    console.log("   Mapping created successfully.");
                } else {
                    console.log("   Mapping already exists.");
                }
            } else {
                console.error("   CRITICAL: ADMIN role not found after creation attempt.");
            }
        }

        console.log("5. Seed completed successfully.");

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
