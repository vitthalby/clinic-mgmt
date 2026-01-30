import { getBranchesMinimal, getAllFeatures } from "@/app/actions/branches"
import BranchesClient from "@/components/management/BranchesClient"

export default async function BranchesPage() {
    const [branches, allFeatures] = await Promise.all([
        getBranchesMinimal(),
        getAllFeatures(),
    ])

    return <BranchesClient branches={branches} allFeatures={allFeatures} />
}
