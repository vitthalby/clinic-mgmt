
import { config } from "dotenv";
config({ path: ".env.local" });

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sql } from "drizzle-orm";

async function main() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) throw new Error("DATABASE_URL is not set");

    console.log("Connecting to database...");
    const client = postgres(connectionString, { max: 1 });
    const db = drizzle(client);

    try {
        console.log("Dropping clinics table if exists...");
        await db.execute(sql`DROP TABLE IF EXISTS "clinics" CASCADE;`);

        console.log("Cleaning up users table (dropping clinic_id column)...");
        // We use sql.raw or just execute directly. CASCADE on drop table handles FKs usually, 
        // but let's be safe about the column in users if CASCADE didn't catch it (it should).
        // Check if column exists before dropping to avoid error? 
        // Postgres: ALTER TABLE "user" DROP COLUMN IF EXISTS "clinic_id";

        await db.execute(sql`ALTER TABLE "user" DROP COLUMN IF EXISTS "clinic_id";`);
        await db.execute(sql`ALTER TABLE "branches" DROP COLUMN IF EXISTS "clinic_id";`);
        await db.execute(sql`ALTER TABLE "customers" DROP COLUMN IF EXISTS "clinic_id";`);
        await db.execute(sql`ALTER TABLE "appointments" DROP COLUMN IF EXISTS "clinic_id";`);
        await db.execute(sql`ALTER TABLE "payments" DROP COLUMN IF EXISTS "clinic_id";`);

        console.log("Cleanup complete.");

    } catch (e) {
        console.error("Cleanup failed:", e);
    } finally {
        await client.end();
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
