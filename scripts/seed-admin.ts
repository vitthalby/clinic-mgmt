import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "../lib/db"
import { roles, users } from "../lib/schema"
import { eq } from "drizzle-orm"

async function main() {
    console.log("Seeding ADMIN role and user...")

    // 1. Ensure ADMIN role exists
    const adminRole = await db.query.roles.findFirst({
        where: eq(roles.name, "ADMIN"),
    })

    if (!adminRole) {
        console.log("Creating ADMIN role...")
        await db.insert(roles).values({
            name: "ADMIN",
            description: "Administrator with full access",
        })
    } else {
        console.log("ADMIN role already exists.")
    }

    // 2. Assign vitthalby@gmail.com to ADMIN role
    const targetEmail = "vitthalby@gmail.com"
    const user = await db.query.users.findFirst({
        where: eq(users.email, targetEmail),
    })

    if (user) {
        console.log(`Updating user ${targetEmail} to ADMIN role...`)
        await db.update(users)
            .set({ role: "ADMIN" })
            .where(eq(users.email, targetEmail))
        console.log("User updated.")
    } else {
        console.log(`User ${targetEmail} not found. Creating user as ADMIN...`)
        // Optional: Create the user if they don't exist, though typically they sign up via Auth first.
        // For now, let's just log it. If the user logs in later, they might need the role update again 
        // or we can pre-create them if we have required fields. 
        // Given the OAuth flow, pre-creating might be tricky without Provider IDs, 
        // but the schema allows creating with just email/role for the 'user' table if ID is auto-gen.

        // Let's pre-create to be helpful.
        try {
            await db.insert(users).values({
                email: targetEmail,
                role: "ADMIN",
                name: "Vitthal (Admin)",
            })
            console.log(`User ${targetEmail} created with ADMIN role.`)
        } catch (e) {
            console.error("Failed to create user (might be missing required fields or constraint violation):", e)
        }
    }

    console.log("Done.")
    process.exit(0)
}

main().catch((err) => {
    console.error(err)
    process.exit(1)
})
