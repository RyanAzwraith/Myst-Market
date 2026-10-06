
import { 
    ButtonWrapper, 
    Card, 
    XMarkIcon 
} from "@/shared";

import { useCartState } from '../hook';
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
    <Card>
        <XMarkIcon
        onClick={() => removeItem(item.product) } 
        />

        <ButtonWrapper onClick={() => onClick?.(item)}>
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
    <Card onClick={() => onClick?.(item)}>
        <OnSaleDiv onSale={item.onSale}>
            <ResolutionInfo item={item} />
        </OnSaleDiv>
    </Card>
    )
}

