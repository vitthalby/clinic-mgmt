import { requirePermission } from "@/lib/auth-utils"
import { getServicesMinimal, getServiceCategories } from "@/app/actions/services"
import ServicesClient from "@/components/management/ServicesClient"

export default async function ServicesPage() {
    // Require view permission for services
    await requirePermission("services", "view")

    // Fetch initial data
    const [services, categories] = await Promise.all([
        getServicesMinimal(),
        getServiceCategories(),
    ])

    return <ServicesClient services={services} categories={categories} />
}
