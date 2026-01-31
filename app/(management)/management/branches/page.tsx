import { getBranchesMinimal, getAllFeatures } from "@/app/actions/branches"
import { getActiveServices } from "@/app/actions/services"
import BranchesClient from "@/components/management/BranchesClient"

export default async function BranchesPage() {
    const [branches, allFeatures, allServices] = await Promise.all([
        getBranchesMinimal(),
        getAllFeatures(),
        getActiveServices(),
    ])

    return <BranchesClient branches={branches} allFeatures={allFeatures} allServices={allServices} />
}
