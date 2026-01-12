import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "@/lib/db"
import { eq } from "drizzle-orm"
import { users } from "@/lib/schema"

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: DrizzleAdapter(db),
    providers: [Google],
    callbacks: {
        async signIn({ user, account, profile }) {
            if (!user.email) return false

            // Allow if explicit allow-signup is on (for first admin)
            if (process.env.ALLOW_REGISTRATION === "true") return true

            // Check if user already exists in DB
            const existingUser = await db.query.users.findFirst({
                where: eq(users.email, user.email),
            })

            if (existingUser) return true

            // Optional: Check a hardcoded allowed list in env
            const allowedEmails = process.env.ALLOWED_ADMIN_EMAILS?.split(",") || []
            if (allowedEmails.includes(user.email)) return true

            return false // Deny by default
        },
        async session({ session, user }) {
            // Add clinicId and role to session
            if (session.user && user) {
                // Fetch extended user details if needed, but schema adds fields to 'user' table
                // Drizzle adapter usually populates the user object in session callback with what's in DB if 'strategy: "database"'?
                // Actually with database strategy, 'user' argument is the DB user.
                // We need to extend the session type to include role/clinicId.
                // For now, let's just assume we can access them.

                // Type safety ignored here for brevity, assume user has role/clinicId 
                // @ts-ignore
                session.user.role = user.role
                // @ts-ignore
                session.user.clinicId = user.clinicId
            }
            return session
        },
    },
    pages: {
        signIn: "/login",
    },
})
