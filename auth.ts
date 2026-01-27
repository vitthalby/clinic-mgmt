import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "@/lib/db"
import { eq } from "drizzle-orm"
import { users } from "@/lib/schema"

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: DrizzleAdapter(db),
    providers: [
        Google({
            allowDangerousEmailAccountLinking: true,
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            if (!user.email) return false

            // Check if user already exists in DB
            const existingUser = await db.query.users.findFirst({
                where: eq(users.email, user.email),
            })

            // If user exists
            if (existingUser) {
                const adminRoleName = process.env.ADMIN_ROLE || "ADMIN"
                // Critical Fix: If it's the main admin and somehow lost role or has no role, fix it.
                if (user.email === "vitthalby@gmail.com" && existingUser.role !== adminRoleName) {
                    await db.update(users).set({ role: adminRoleName }).where(eq(users.email, user.email))
                }
                return true
            }

            // New User Registration

            // 1. Allow specific Admin bootstrap even if registration is closed
            if (user.email === "vitthalby@gmail.com") {
                return true // Will be created by adapter
            }

            // 2. Check general registration policy
            if (process.env.ALLOW_REGISTRATION === "true") return true

            // 3. Check allow list
            const allowedEmails = process.env.ALLOWED_ADMIN_EMAILS?.split(",") || []
            if (allowedEmails.includes(user.email)) return true

            return false // Deny by default
        },
        async session({ session, user }) {
            // @ts-ignore
            if (session.user && user) {
                // @ts-ignore
                session.user.id = user.id
                // @ts-ignore
                session.user.role = user.role
            }
            return session
        },
    },
    pages: {
        signIn: "/login",
        error: "/login",
    },
})
