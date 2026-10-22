
import { 
    ButtonWrapper, 
    Card, 
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
import { OnSaleDiv } from './presentation';


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
    <Card variant="compact" className="item-card">
        <XMarkIcon
        className="item-remove-icon"
        buttonClassName="item-remove-button"
        onClick={() => removeItem(item.product) } 
        />

        <ButtonWrapper
        className="item-card-button"
        onClick={() => onClick?.(item)}
        >
            <OnSaleDiv onSale={item.onSale}>
                <ItemInfo item={item} />
            </OnSaleDiv>
        </ButtonWrapper>
    </Card>
    )
}


function ResolutionCard({ item, onClick}: { 
    item: ItemResolution,
    onClick?: (item: ItemResolution) => void
}) {
    return (
    <Card className="resolution-card" onClick={() => onClick?.(item)}>
        <OnSaleDiv onSale={item.onSale}>
            <ResolutionInfo item={item} />
        </OnSaleDiv>
    </Card>
    )
}
