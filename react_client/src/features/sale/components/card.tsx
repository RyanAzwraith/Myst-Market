
import { Card } from "@/shared/elements/card";
import { PopUpModalComponent } from "@/shared/PopUpModalComponent";

import { SaleModal } from "./modal";

import { 
    type MediaDetail,
    Image,
} from "../index";

import type { Sale, SaleAnalytics } from '../schema'


export {
    SaleCard,
    SaleRow,
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
        <h1>
            {sale.name}
        </h1>
        <Image media={image} />
        <h2>
            {sale.discountPerc}% off!
        </h2>
        <p>
            {sale.startAt} to {sale.endAt}
        </p>
    </Card>
    )
}

function SaleRow({ sale }: { 
    sale: SaleAnalytics 
}) {
	return (
		<PopUpModalComponent
		content={() => 
            <SaleModal id={sale.id} />
        } >
			<div>
				<div>{sale.name}</div>
				<div>{sale.discountPerc}% off</div>
				<div>start: {sale.startAt}</div>
				<div>end: {sale.endAt}</div>
				<div>Revenue: {sale.revenue}</div>
				<div>Orders: {sale.orderCount}</div>
			</div>
		</PopUpModalComponent>
	);
}