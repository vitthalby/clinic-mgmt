
import AccessDeniedContent from "@/components/AccessDeniedContent"

export const metadata = {
    title: "Access Denied | Clinic Management",
    description: "You are not authorized to access this section.",
}

export default function AccessDeniedPage() {
    // Read from env on server side
    const redirectSeconds = parseInt(process.env.ACCESS_DENIED_REDIRECT_SECONDS || "10")

    return (
        <AccessDeniedContent
            redirectPath="/login"
            redirectSeconds={redirectSeconds}
        />
    )
}
