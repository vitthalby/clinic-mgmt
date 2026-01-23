
import { signIn } from "@/auth"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { siteConfig } from "@/config/site"
import Image from "next/image"

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
                    {/* Logo Section */}
                    <div className="mx-auto mb-6 flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-white shadow-md border-2 border-indigo-50">
                        {siteConfig.logo ? (
                            <div className="relative h-full w-full">
                                <Image
                                    src={siteConfig.logo}
                                    alt={siteConfig.name}
                                    fill
                                    className="object-contain p-3"
                                    priority
                                />
                            </div>
                        ) : (
                            <span className="text-4xl font-extrabold text-indigo-600">
                                {siteConfig.name.charAt(0)}
                            </span>
                        )}
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                        {siteConfig.name}
                    </h2>
                    <p className="mt-2 text-lg font-medium text-gray-700">
                        {siteConfig.category}
                    </p>
                    <p className="text-sm text-gray-500">{siteConfig.tagline}</p>
                    <h3 className="mt-6 text-xl font-bold text-gray-900">
                        Management Login
                    </h3>
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
