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

    // Fetch user directly from DB to ensure freshest role data
    const dbUser = await db.query.users.findFirst({
        where: eq(users.email, session.user.email)
    })

    const role = dbUser?.role || session.user.role
    const branches = await getAvailableBranches()

    // Auto-select if only 1 branch and not admin
    if (role === 'ADMIN') {
        redirect("/management")
    }

    if (branches.length === 1) {
        return (
            <div className="min-h-screen bg-surface flex items-center justify-center">
                <AutoBranchSelector branchId={branches[0].id} />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-surface flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange/10 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue/10 blur-[120px] rounded-full"></div>
            </div>

            <div className="w-full max-w-4xl relative z-10">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                        Select <span className="text-gradient">Branch</span>
                    </h1>
                    <p className="text-white/60 text-lg">
                        {branches.length > 0
                            ? "Choose a location to manage your clinic workflow"
                            : "Welcome to the management portal"}
                    </p>
                    {role === 'ADMIN' && (
                        <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full bg-orange/10 border border-orange/20 text-orange-light text-sm font-medium">
                            <ShieldCheck size={14} className="mr-2" />
                            Admin Account Verified
                        </div>
                    )}
                </div>

                {branches.length === 0 ? (
                    <div className="glass-panel p-10 rounded-3xl text-center max-w-md mx-auto">
                        {role === 'ADMIN' ? (
                            <>
                                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <Building2 className="text-orange" size={32} />
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2">Initialize Clinic</h2>
                                <p className="text-white/50 mb-8">
                                    You haven't set up any branches for your clinic yet. Start by accessing the dashboard.
                                </p>
                                <a
                                    href="/management"
                                    className="btn-primary inline-flex items-center text-white"
                                >
                                    Go to Dashboard <ArrowRight size={18} className="ml-2" />
                                </a>
                            </>
                        ) : (
                            <>
                                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <Ghost className="text-gray-500" size={32} />
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2">Access Restricted</h2>
                                <p className="text-white/50 mb-4">
                                    Your account is not assigned to any branches. Please contact your administrator.
                                </p>
                                <div className="text-[10px] text-white/20 font-mono mt-8 uppercase tracking-widest">
                                    Verified Role: {role || 'Unknown'}
                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {branches.map((branch) => (
                            <form key={branch.id} action={async () => {
                                "use server"
                                await selectBranch(branch.id)
                                redirect("/management")
                            }}>
                                <button type="submit" className="glass-card w-full text-left p-8 rounded-3xl group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <Building2 size={80} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-orange transition-colors">{branch.name}</h3>
                                    <p className="text-white/40 text-sm mb-6 max-w-[80%]">
                                        {branch.address || "Contact details not available for this location."}
                                    </p>
                                    <div className="flex items-center text-orange-light text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
                                        Enter Branch <ArrowRight size={16} className="ml-2" />
                                    </div>
                                </button>
                            </form>
                        ))}
                    </div>
                )}

                <div className="mt-12 text-center text-white/20 text-xs">
                    Clinic Management System &copy; 2026 • Secure Infrastructure
                </div>
            </div>
        </div>
    )
}
