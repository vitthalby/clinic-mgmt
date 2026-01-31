import { useState, useCallback } from "react"

export interface ExpandableTableConfig<TMinimal, TExpandedData> {
    initialData: TMinimal[]
    fetchList: () => Promise<TMinimal[]>
    fetchExpandedData: (id: string) => Promise<TExpandedData | null>
}

export function useExpandableTable<TMinimal extends { id: string }, TExpandedData>({
    initialData,
    fetchList,
    fetchExpandedData,
}: ExpandableTableConfig<TMinimal, TExpandedData>) {
    const [items, setItems] = useState<TMinimal[]>(initialData)
    const [expandedData, setExpandedData] = useState<Record<string, TExpandedData>>({})
    const [loadingDetails, setLoadingDetails] = useState<Record<string, boolean>>({})

    const refreshList = useCallback(async () => {
        const updated = await fetchList()
        setItems(updated)
        
        // Reload expanded data for currently expanded items
        const expandedIds = Object.keys(expandedData)
        if (expandedIds.length > 0) {
            const dataPromises = expandedIds.map(async (id) => {
                const data = await fetchExpandedData(id)
                return { id, data }
            })
            
            const results = await Promise.all(dataPromises)
            const newExpandedData: Record<string, TExpandedData> = {}
            results.forEach(({ id, data }) => {
                if (data) {
                    newExpandedData[id] = data
                }
            })
            setExpandedData(newExpandedData)
        }
    }, [fetchList, fetchExpandedData, expandedData])

    const loadExpandedData = useCallback(async (id: string, force: boolean = false): Promise<TExpandedData | null> => {
        if (expandedData[id] && !force) return expandedData[id]
        
        setLoadingDetails(prev => ({ ...prev, [id]: true }))
        try {
            const data = await fetchExpandedData(id)
            if (data) {
                setExpandedData(prev => ({ ...prev, [id]: data }))
            }
            return data
        } finally {
            setLoadingDetails(prev => ({ ...prev, [id]: false }))
        }
    }, [fetchExpandedData, expandedData])

    const clearExpandedItem = useCallback((id: string) => {
        setExpandedData(prev => {
            const newState = { ...prev }
            delete newState[id]
            return newState
        })
    }, [])

    const clearAllExpanded = useCallback(() => {
        setExpandedData({})
    }, [])

    return {
        items,
        expandedData,
        loadingDetails,
        refreshList,
        loadExpandedData,
        clearExpandedItem,
        clearAllExpanded,
    }
}
