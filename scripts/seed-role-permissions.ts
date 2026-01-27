import { config } from "dotenv";
config({ path: ".env.local" });

import { eq, and } from "drizzle-orm"
// db, features, roles, roleFeaturePermissions imported dynamically

async function main() {
    const { db } = await import("../lib/db")
    const { features, roles, roleFeaturePermissions } = await import("../lib/schema")

    console.log("Seeding Admin permissions...")

    // 1. Get ADMIN role
    const adminRole = await db.query.roles.findFirst({
        where: eq(roles.name, "ADMIN"),
    })

    if (!adminRole) {
        console.error("ADMIN role not found. Please run seed-admin.ts first.")
        process.exit(1)
    }

    // 2. Get all features
    const allFeatures = await db.select().from(features)

    console.log(`Found ${allFeatures.length} features.`)

    // 3. Assign all permissions to ADMIN
    for (const feat of allFeatures) {
        const existing = await db.query.roleFeaturePermissions.findFirst({
            where: and(
                eq(roleFeaturePermissions.roleId, adminRole.id),
                eq(roleFeaturePermissions.featureId, feat.id)
            )
        })

        if (!existing) {
            console.log(`Granting full access for ${feat.name} to ADMIN`)
            await db.insert(roleFeaturePermissions).values({
                roleId: adminRole.id,
                featureId: feat.id,
                canView: true,
                canAdd: true,
                canEdit: true,
                canDelete: true,
            })
        } else {
            // Update to ensure full access if it exists but incomplete
            await db.update(roleFeaturePermissions)
                .set({
                    canView: true,
                    canAdd: true,
                    canEdit: true,
                    canDelete: true,
                })
                .where(and(
                    eq(roleFeaturePermissions.roleId, adminRole.id),
                    eq(roleFeaturePermissions.featureId, feat.id)
                ))
            console.log(`Updated access for ${feat.name} to ADMIN`)
        }
    }

    console.log("Done.")
    process.exit(0)
}

main().catch((err) => {
    console.error(err)
    process.exit(1)
})
