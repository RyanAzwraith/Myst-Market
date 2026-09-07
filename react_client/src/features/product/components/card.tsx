import { PopUpModalComponent } from "@/shared/PopUpModalComponent";
import { formatMoney } from "@/utils/formatMoney";

import { 
    AddToCartButton,
    Media,
    type SaleSummary,
    type MediaDetail,
} from "../index";

import type { 
    Product,
    ProductAnalytics
} from '../schema'
import { ProductModal } from "./modal"
import { PriceFormat } from './format'


export {
    ProductCard,
    ProductRow,
}


function ProductCard({ product, image, onClick, onSaleClick }: {
    product: Product, 
    image: MediaDetail | undefined, 
    onClick?: (product: Product) => void
    onSaleClick?: (sale?: SaleSummary) => void
}) {
    return (
    <div 
    className="rounded border border-slate-200 bg-white p-3 shadow-sm"
    >
        <div
        onClick={() => onClick?.(product)}>
            <Media media={image} />
            <h2 className="mt-2 font-semibold">{product.name}</h2>
        </div>
        
        <p className="text-sm text-slate-600">
            {product.categoryName} - {product.rarityName}
        </p>

        <PriceFormat product={product} 
        onClick={onSaleClick} 
        />
        <AddToCartButton product={product}/>
    </div>
    )
}

function ProductRow({ product }: { 
    product: ProductAnalytics 
}) {
    return (
    <PopUpModalComponent
    content={() => <ProductModal productId={product.id} />}
    >
        <div>
            <div>{product.name}</div>
            <div>{product.categoryName} / {product.rarityName}</div>
            <div>{formatMoney(product.priceAudCent)}</div>
            <div>Stock: {product.stock}</div>
            <div>Reviews: {product.reviews}</div>
        </div>
    </PopUpModalComponent>
  );
}