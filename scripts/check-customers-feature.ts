import { db } from "../lib/db"
import { features, roleFeaturePermissions, roles, branchFeatures } from "../lib/schema"
import { eq } from "drizzle-orm"

async function checkCustomersFeature() {
    console.log("Checking 'customers' feature...")
    
    // Check if feature exists
    const customersFeature = await db.query.features.findFirst({
        where: eq(features.key, "customers")
    })
    
    if (!customersFeature) {
        console.log("❌ 'customers' feature NOT found in database!")
        console.log("This is the issue - the feature needs to be created.")
        return
    }
    
    console.log("✓ 'customers' feature found:", customersFeature)
    
    // Check role permissions for this feature
    const allRoles = await db.query.roles.findMany()
    console.log("\nChecking role permissions for 'customers' feature:")
    
    for (const role of allRoles) {
        const permission = await db.query.roleFeaturePermissions.findFirst({
            where: (rfp, { and, eq }) => and(
                eq(rfp.roleId, role.id),
                eq(rfp.featureId, customersFeature.id)
            )
        })
        
        if (permission) {
            console.log(`\n✓ Role: ${role.name}`)
            console.log(`  - canView: ${permission.canView}`)
            console.log(`  - canAdd: ${permission.canAdd}`)
            console.log(`  - canEdit: ${permission.canEdit}`)
            console.log(`  - canDelete: ${permission.canDelete}`)
        } else {
            console.log(`\n❌ Role: ${role.name} - NO PERMISSIONS SET`)
        }
    }
    
    // Check branch features
    console.log("\n\nChecking branch feature enablement:")
    const branchFeaturesList = await db.query.branchFeatures.findMany({
        where: eq(branchFeatures.featureId, customersFeature.id)
    })
    
    if (branchFeaturesList.length === 0) {
        console.log("❌ 'customers' feature is NOT enabled for any branch!")
    } else {
        console.log(`✓ 'customers' feature is enabled for ${branchFeaturesList.length} branch(es)`)
    }
    
    process.exit(0)
}

checkCustomersFeature().catch(console.error)
