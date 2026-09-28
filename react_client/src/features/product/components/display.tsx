
import type { ReactNode } from "react";
import { listToRecord } from "@/utils/funcs";
import { 
    ChevronDownIcon,
    List,
    Display,
} from "@/shared";
import { PopUpModalComponent } from "@/shared/PopUpModalComponent";
import { 
    NumberEditField, 
    SelectEditComponent, 
    SelectOneEditField 
} from "@/hooks/SelectEdit/SelectEditComponent";

import { 
    type MediaDetail,
    AddToCartButton,
} from "../index";

import type { 
    Product, 
} from "../schema";
import { 
    useAdminSearchParams,
    useAdminSearchQuery,
    useAdminSelectEdit,
    useProductQuery, 
    useSearchParams, 
    useSearchQuery 
} from "../service";

import { PriceFormat } from "./format";
import { ProductCarousel } from "./media";
import { AdminSearchParamsComponent } from "./components";
import { ProductRow } from "./card";
import { CreateProductModal } from "./modal";


export {
    SearchDisplay,
    ProductDisplay,
    AdminSearchDisplay
}


function SearchDisplay({ renderProduct }: {
    renderProduct: (product: Product, image: MediaDetail | undefined) => ReactNode
}) {
    const { bindings: { categories, search }, values } = useSearchParams()

    const limit = 20

    const {
        data, fetchNextPage, hasNextPage 
    } = useSearchQuery(limit, values())

    const products = data?.pages.flatMap(page => page.products) ?? []
    const imagesRecord = listToRecord(
        data?.pages.flatMap(page => page.images) ?? [], 
        (img) => [img.id, img]
    )

    const title = search.get() 
        ? `Searching: ${search.get() as string}` 
        : (categories.get() as string[]).join(', ') || "All Products"

    return (
        <Display> 
            <h1 className="mb-2 text-lg font-semibold">{title}</h1> 
            <div className="flex flex-wrap gap-4">
                <List
                items={products}
                renderItem={(p) => renderProduct(p, imagesRecord[p.id])}
                />

                <ChevronDownIcon 
                onClick={fetchNextPage}
                hidden={!hasNextPage}
                />
            </div>
        </Display>
    )
}

function ProductDisplay({ slug }: {
    slug: string | undefined
}) {
    const {data: product} = useProductQuery(slug)
    if (!slug || !product) return (
        <div>Loading...</div>
    )
    
    return (
        <div className="rounded border border-slate-200 bg-white p-4">
            <h1>{product.name}</h1>
            <ProductCarousel productId={product.id} limit={10} />

            <p>{product.categoryName} - {product.rarityName}</p>
            <PriceFormat product={product} />
            <p>Stock {product.stock}</p>

            <AddToCartButton product={product}/>
            
            <p>{product.description}</p>
    
            <ProductReviewsComponent productId={product.id} />
        </div>
    )

}

function AdminSearchDisplay({ limit }: {
    limit: number
}) {
    const params = useAdminSearchParams()
    const {
        bindings:{categories, rarities, search }, values
    } = params;

    const { data, fetchNextPage, hasNextPage } = useAdminSearchQuery(
        limit, values()
    );
    const products = data?.pages.flatMap(page => page.products) ?? [];

    const selectEdit = useAdminSelectEdit(products);

    const title = search.get()
        ? `Searching: ${search.get() as string}`
        : (categories.get() as string[]).concat(rarities.get() as string[]).join(', ')
        || 'All Products';

  return (
    <div>
        <AdminSearchParamsComponent/>

        <h1 className="mb-2 text-lg font-semibold">{title}</h1>
        <PopUpModalComponent
        content={onClose => 
            <CreateProductModal onClose={onClose} />
        }>
            <span>Create product</span>
        </PopUpModalComponent>

        <SelectEditComponent
        fieldComponents={ <>
            <SelectOneEditField field={selectEdit.categoryName} />
            <SelectOneEditField field={selectEdit.rarityName} />
            <NumberEditField field={selectEdit.priceAudCent} />
            <NumberEditField field={selectEdit.stock} />
        </> }
        itemComponents={listToRecord(products, (p) => [String(p.id), 
            <ProductRow key={p.id} product={p} />
        ])}
        useSelectEdit={selectEdit}
        />

        <ChevronDownIcon
        onClick={() => fetchNextPage()}
        hidden={!hasNextPage}
        />

    </div>
  );
}