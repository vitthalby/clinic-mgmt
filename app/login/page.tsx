
import { signIn } from "@/auth"
import { redirect } from "next/navigation"
import { auth } from "@/auth"

export default async function LoginPage() {
    const session = await auth()

    // If already logged in, redirect based on role or context
    if (session?.user) {
        redirect("/management")
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow-lg">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Sign in to Management
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Access the secure clinic dashboard
                    </p>
                </div>
                <form
                    action={async () => {
                        "use server"
                        await signIn("google", { redirectTo: "/management" })
                    }}
                    className="mt-8 space-y-6"
                >
                    <button
                        type="submit"
                        className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Sign in with Google
                    </button>
                </form>
            </div>
        </div>
    )
}
