import { getAvailableBranches, selectBranch } from "@/app/actions/branches"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import AutoBranchSelector from "@/components/management/AutoBranchSelector"
import { db } from "@/lib/db"
import { users } from "@/lib/schema"
import { eq } from "drizzle-orm"
import { Building2, ArrowRight, ShieldCheck, Ghost } from "lucide-react"

export default async function SelectBranchPage() {
    const session = await auth()
    if (!session || !session.user?.email) redirect("/login")

    const dbUser = await db.query.users.findFirst({
        where: eq(users.email, session.user.email)
    })

    const adminRoleName = process.env.ADMIN_ROLE || "ADMIN"
    const role = dbUser?.role || session.user.role
    const branches = await getAvailableBranches()

    if (role === adminRoleName) {
        redirect("/management")
    }

    if (branches.length === 1) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center">
                <AutoBranchSelector branchId={branches[0].id} />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center p-6">
            <div className="w-full max-w-4xl">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
                        Select Your Branch
                    </h1>
                    <p className="text-gray-600 text-lg">
                        {branches.length > 0
                            ? "Choose a location to manage your clinic workflow"
                            : "Welcome to the management portal"}
                    </p>
                    {role === adminRoleName && (
                        <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full bg-purple-100 border border-purple-200 text-purple-800 text-sm font-medium">
                            <ShieldCheck size={14} className="mr-2" />
                            Admin Account Verified
                        </div>
                    )}
                </div>

                {branches.length === 0 ? (
                    <div className="bg-white shadow-lg p-10 rounded-2xl text-center max-w-md mx-auto border border-gray-200">
                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Ghost className="text-gray-400" size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h2>
                        <p className="text-gray-600 mb-4">
                            Your account is not assigned to any branches. Please contact your administrator.
                        </p>
                        <div className="text-xs text-gray-400 font-mono mt-8 uppercase tracking-widest">
                            Verified Role: {role || 'Unknown'}
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {branches.map((branch) => (
                            <form key={branch.id} action={async () => {
                                "use server"
                                await selectBranch(branch.id)
                                redirect("/management")
                            }}>
                                <button type="submit" className="bg-white shadow-lg hover:shadow-xl w-full text-left p-8 rounded-2xl group relative overflow-hidden border border-gray-200 transition-all">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <Building2 size={80} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">{branch.name}</h3>
                                    <p className="text-gray-500 text-sm mb-6 max-w-[80%]">
                                        {branch.address || "Contact details not available for this location."}
                                    </p>
                                    <div className="flex items-center text-indigo-600 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
                                        Enter Branch <ArrowRight size={16} className="ml-2" />
                                    </div>
                                </button>
                            </form>
                        ))}
                    </div>
                )}

                <div className="mt-12 text-center text-gray-400 text-xs">
                    Clinic Management System &copy; 2026
                </div>
            </div>
        </div>
    )
}
