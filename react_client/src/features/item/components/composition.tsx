
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
    <Card className="relative p-2">
        <XMarkIcon
        className="h-5 w-5 text-gray-500"
        buttonClassName="absolute right-1 top-1 rounded p-1 hover:bg-gray-100"
        onClick={() => removeItem(item.product) } 
        />

        <ButtonWrapper
        className="block w-full text-left"
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
    <Card onClick={() => onClick?.(item)}>
        <OnSaleDiv onSale={item.onSale}>
            <ResolutionInfo item={item} />
        </OnSaleDiv>
    </Card>
    )
}
