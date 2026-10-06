
import { Card } from "@/shared";

import { 
    type MediaDetail,
} from "../index";

import type { Sale } from '../schema'

import { 
    SaleInfo, 
} from "./content";


export {
    SaleCard,
}


function SaleCard({ sale, image, onClick }: {
    sale: Sale, 
    image: MediaDetail | undefined, 
    onClick?: (sale: Sale) => void
}) {
    return (
    <Card
    onClick={() => onClick?.(sale)}
    >
        <SaleInfo sale={sale} image={image} />
    </Card>
    )
}
