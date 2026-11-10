import { useResolveQuery, type ItemResolution } from "@/features/order"
import { itemSummary, type ItemSummary } from "../schema"
import { useEffect } from "react"
import { Loading } from "@/shared"


export { ResolutionLoader }

function ResolutionLoader({ 
    onSuccess, render
}: { 
    onSuccess?: (items: ItemSummary[]) => void
    render: (
        data: {items: ItemResolution[], 
        totalCent: number}
    ) => React.ReactNode
}) {
    const {data} = useResolveQuery()

    useEffect(() => {
        if (data) onSuccess?.(data.items.map(itemSummary.from.itemResolution))
    }, [data, onSuccess])

    if (!data) return <Loading />
    return render({
        items: data.items, 
        totalCent: data.totalCent
    })
}