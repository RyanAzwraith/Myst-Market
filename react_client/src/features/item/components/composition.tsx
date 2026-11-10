
import { 
    ButtonWrapper, 
    Card, 
    SaleBadge,
    XMarkIcon 
} from "@/shared";

import { useCartState } from '../state';
import type { 
    Item, 
    ItemResolution 
} from '../schema';
import { 
    ItemInfo, 
    ResolutionInfo 
} from './content';


export {
    ResolutionCard,
    ItemCard
}

function ItemCard({ item, onClick}: { 
    item: Item,
    onClick?: (item: Item) => void
}) {
    const removeItem = useCartState(state => state.removeItem)
    return (
    <Card
    variant="compact"
    className={`item-card product-card-theme-${item.product.rarityName}`}
    >
        <SaleBadge
        sale={item.product.sale}
        size="small"
        className="item-sale-badge"
        />
        <XMarkIcon
        className="item-remove-icon"
        buttonClassName="item-remove-button"
        onClick={() => removeItem(item.product) } 
        />

        <ButtonWrapper
        className="item-card-button"
        onClick={() => onClick?.(item)}
        >
            <ItemInfo item={item} />
        </ButtonWrapper>
    </Card>
    )
}


function ResolutionCard({ item, onClick}: { 
    item: ItemResolution,
    onClick?: (item: ItemResolution) => void
}) {
    return (
    <Card
    className={`resolution-card product-card-theme-${item.product.rarityName}`}
    onClick={() => onClick?.(item)}
    >
        <ResolutionInfo item={item} />
    </Card>
    )
}
