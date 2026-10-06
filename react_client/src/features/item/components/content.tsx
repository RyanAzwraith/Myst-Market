
import { 
    Heading, 
    MoneyFormat,
    Text,
} from '@/shared'

import { ProductImage } from "../index";

import type { 
    ItemResolution, 
    Item 
} from "../schema";


export {
    ItemInfo,
    ResolutionInfo,
}


function ItemInfo({ item }: { 
    item: Item
}) {
    const product = item.product
    return (
    <>
        <ProductImage productId={product.id} /> 
        <Heading level={2}>{product.name}</Heading>
        <Text><MoneyFormat amount={item.priceCent} /> each </Text>
        <Text>{item.quantity}x </Text>
        <Text><MoneyFormat amount={item.priceCent * item.quantity} /> total </Text>
    </>
    )
}

function ResolutionInfo({ item }: { 
    item: ItemResolution
}) {
    const product = item.product
    return (
    <>
        <ProductImage productId={product.id} /> 
        <Heading level={2}>{product.name}</Heading>
        <Text><MoneyFormat amount={item.unitPriceCent} /> each </Text>
        <Text>{item.quantity}x </Text>
        <Text><MoneyFormat amount={item.lineTotalCent} /> total </Text>
    </>
    )
}


