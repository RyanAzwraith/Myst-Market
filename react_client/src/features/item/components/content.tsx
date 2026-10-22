
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
    <div className="item-info">
        <ProductImage
        productId={product.id}
        className="item-image"
        />
        <div className="item-details">
            <Heading level={2} className="item-name">
                {product.name}
            </Heading>
            <Text className="item-price">
                <MoneyFormat amount={item.priceCent} /> each
            </Text>
            <Text className="item-quantity">
                {item.quantity}x
            </Text>
            <Text className="item-total">
                <MoneyFormat amount={item.priceCent * item.quantity} /> total
            </Text>
        </div>
    </div>
    )
}

function ResolutionInfo({ item }: { 
    item: ItemResolution
}) {
    const product = item.product
    return (
    <div className="resolution-info">
        <ProductImage
        productId={product.id}
        className="item-image"
        />
        <div className="item-details">
            <Heading level={2} className="item-name">
                {product.name}
            </Heading>
            <Text className="item-price">
                <MoneyFormat amount={item.unitPriceCent} /> each
            </Text>
            <Text className="item-quantity">
                {item.quantity}x
            </Text>
            <Text className="item-total">
                <MoneyFormat amount={item.lineTotalCent} /> total
            </Text>
        </div>
    </div>
    )
}
