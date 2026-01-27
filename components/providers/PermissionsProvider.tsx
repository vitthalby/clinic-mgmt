"use client"

import { PermissionMap } from "@/lib/permissions"
import { createContext, useContext, ReactNode } from "react"

const PermissionsContext = createContext<PermissionMap>({})

export function PermissionsProvider({
    permissions,
    children
}: {
    permissions: PermissionMap
    children: ReactNode
}) {
    return (
        <PermissionsContext.Provider value={permissions}>
            {children}
        </PermissionsContext.Provider>
    )
}

export function usePermissions() {
    return useContext(PermissionsContext)
}

export function useFeaturePermissions(featureKey: string) {
    const permissions = usePermissions()
    return permissions[featureKey] || {
        canView: false,
        canAdd: false,
        canEdit: false,
        canDelete: false
    }
}
