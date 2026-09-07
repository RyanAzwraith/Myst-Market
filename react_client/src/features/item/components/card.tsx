
import { formatMoney } from '@/utils/formatMoney'
import { ButtonWrapper, Card, XMarkIcon } from "@/shared";

import type { ItemResolution} from "../index";
import { ProductImage } from "../index";
import { useCartState } from '../service';
import type { Item } from '../schema';


export {
    ItemCard,
    ItemWithXCard
}

function ItemCard({ item, onClick}: { 
    item: ItemResolution,
    onClick?: (item: ItemResolution) => void
}) {
    const productSummary = item.productSummary
    return (
        <Card>
            
            <ButtonWrapper onClick={() => onClick?.(item)}>
                <ProductImage productId={productSummary.id} />
                <h2 className="mt-2 font-semibold">{productSummary.name}</h2>
            </ButtonWrapper>
            
            <div className={item.onSale ? "bg-red-200" : ""} >
                <p>{formatMoney(item.unitPriceCent)} each </p>
                <p>{item.quantity}x </p>
                <p>{formatMoney(item.lineTotalCent)} total </p>
            </div>

        </Card>
    )
}

function ItemWithXCard({ item, onClick}: { 
    item: Item,
    onClick?: (item: Item) => void
}) {
    const removeItem = useCartState(state => state.removeItem)
    const productSummary = item.product
    return (
        <Card>
            
            <ButtonWrapper onClick={() => onClick?.(item)}>
                <ProductImage productId={productSummary.id} />
                <h2 className="mt-2 font-semibold">{productSummary.name}</h2>
            </ButtonWrapper>
            
            <div className={item.onSale ? "bg-red-200" : ""} >
                <p>{formatMoney(item.priceCent)} each </p>
                <p>{item.quantity}x </p>
                <p>{formatMoney(item.priceCent * item.quantity)} total </p>
            </div>

            <XMarkIcon
            onClick={() => removeItem(item.product) } 
            />

        </Card>
    )
}
