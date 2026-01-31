import { config } from "dotenv";
config({ path: ".env.local" });

import { eq } from "drizzle-orm"
// db and features imported dynamically to ensure env vars are loaded first

const featureList = [
    { key: "dashboard", name: "Dashboard", description: "Access to the main dashboard", actions: ["view"] },
    { key: "appointments", name: "Appointments", description: "Manage appointments", actions: ["view", "add", "edit", "delete"] },
    { key: "customers", name: "Customers", description: "Manage customer records", actions: ["view", "add", "edit", "delete"] },
    { key: "payments", name: "Payments", description: "Manage payments and transactions", actions: ["view", "add", "edit"] },
    { key: "branches", name: "Branches", description: "Manage clinic branches", actions: ["view", "add", "edit", "delete"] },
    { key: "users", name: "Staff Management", description: "Manage staff and users", actions: ["view", "add", "edit", "delete"] },
    { key: "roles", name: "Roles", description: "Manage roles and permissions", actions: ["view", "add", "edit", "delete"] },
    { key: "services", name: "Services", description: "Manage master service catalog", actions: ["view", "add", "edit", "delete"] },
    { key: "settings", name: "Settings", description: "Application settings", actions: ["view", "edit"] },
]

async function main() {
    const { db } = await import("../lib/db")
    const { features } = await import("../lib/schema")

    console.log("Seeding features...")

    for (const feat of featureList) {
        const existing = await db.query.features.findFirst({
            where: eq(features.key, feat.key),
        })

        if (!existing) {
            console.log(`Creating feature: ${feat.name}`)
            await db.insert(features).values({
                key: feat.key,
                name: feat.name,
                description: feat.description,
                availableActions: feat.actions,
            })
        } else {
            // Update existing to ensure new schema column is populated correctly
            console.log(`Updating feature: ${feat.name}`)
            await db.update(features).set({
                availableActions: feat.actions
            }).where(eq(features.key, feat.key))
        }
    }

    console.log("Done.")
    process.exit(0)
}

main().catch((err) => {
    console.error(err)
    process.exit(1)
})
