import { useEffect } from "react"

import { formatMoney } from "@/utils/formatMoney"
import { Loading } from "@/shared/elements/text"
import { List } from "@/shared/elements/list"

import { 
    itemSummary, 
    type ItemSummary 
} from "../schema"
import { useResolveQuery } from "../service"
import { ItemCard } from "./card"


export { CartFormSection }


function CartFormSection({ setItems, onItemCardClick }: { 
    setItems: React.Dispatch<React.SetStateAction<ItemSummary[] | null>>,
    onItemCardClick?: (item: ItemSummary) => void
}) {
    const {data} = useResolveQuery()

    useEffect(() => {
        if (data) setItems(data.items.map(itemSummary.from.itemResolution))
    }, [data, setItems])

    if (!data) return <Loading />
    return (
        <section>
            <h2>Cart</h2>   
            <List
            items={data.items}
            renderItem={o => 
                <ItemCard 
                key={o.productSummary.name} 
                item={o}
                onClick={() => 
                    onItemCardClick?.(itemSummary.from.itemResolution(o))
                }/>
            }/>
            <p>{formatMoney(data.totalCent)}</p>
        </section>
    )
}