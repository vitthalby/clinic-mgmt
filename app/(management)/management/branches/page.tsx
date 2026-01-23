import { getBranches } from "@/app/actions/branches"
import BranchesClient from "@/components/management/BranchesClient"

export default async function BranchesPage() {
    const branches = await getBranches()

    return <BranchesClient branches={branches} />
}
