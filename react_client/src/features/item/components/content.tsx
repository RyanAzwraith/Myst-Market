
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
    <div className="flex items-center gap-3 text-gray-900">
        <ProductImage
        productId={product.id}
        className="h-16 w-16 shrink-0 rounded object-cover"
        />
        <div className="min-w-0 space-y-0.5">
            <Heading level={2} className="truncate text-sm text-gray-900">
                {product.name}
            </Heading>
            <Text className="text-xs text-gray-600">
                <MoneyFormat amount={item.priceCent} /> each
            </Text>
            <Text className="text-xs text-gray-600">
                {item.quantity}x
            </Text>
            <Text className="text-sm font-semibold text-gray-900">
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
    <div className="flex items-center gap-3 text-gray-900">
        <ProductImage
        productId={product.id}
        className="h-16 w-16 shrink-0 rounded object-cover"
        />
        <div className="min-w-0 space-y-0.5">
            <Heading level={2} className="truncate text-sm text-gray-900">
                {product.name}
            </Heading>
            <Text className="text-xs text-gray-600">
                <MoneyFormat amount={item.unitPriceCent} /> each
            </Text>
            <Text className="text-xs text-gray-600">
                {item.quantity}x
            </Text>
            <Text className="text-sm font-semibold text-gray-900">
                <MoneyFormat amount={item.lineTotalCent} /> total
            </Text>
        </div>
    </div>
    )
}

