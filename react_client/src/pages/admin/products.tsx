import { useState } from "react";

import { listToRecord } from "@/utils/funcs";
import { 
    ChevronDownIcon,
    Page
} from "@/shared";
import { PopUpModalComponent } from "@/shared/composition/PopUpModalComponent";

import { SelectEditDisplay } from "@/hooks/SelectEdit/components";
import { 
    QueryParamFields 
} from "@/hooks/QueryParams";

import { 
    type Product,
    type ProductAnalytics,
    AdminSearchTitle,
    AdminSummaryInfo,
    AdminSearchLoader,
    CreateForm,
    AnalyticsLoader,
    AnalyticsInfo,
    DeleteButton,
    UpdateForm
} from "@/features/product"


export { ProductsPage }


function ProductsPage() {
    return (
    <Page>
        <CreateButton />
        <AdminSearchLoader
        limit={20}
        render={({searchQuery, searchParams, selectEdit, products}) => <>
            <QueryParamFields queryParams={searchParams} />
            <AdminSearchTitle adminSearchParams={searchParams} />

            <SelectEditDisplay
            selectEdit={selectEdit}
            elements={listToRecord(products, (p) => [String(p.id), 
                <Row key={p.id} product={p} />
            ])}/>

            <ChevronDownIcon 
            onClick={searchQuery.fetchNextPage}
            hidden={!searchQuery.hasNextPage}
            />
        </> } />
    </Page>
    )
}

function CreateButton() {
    return (
    <PopUpModalComponent
    content={onClose => 
        <>
        <h2>Create Product</h2>
        <CreateForm
        onSuccess={onClose}
        />
        </>
    }>
        <span>Create product</span>
    </PopUpModalComponent>
    )
}

function Row({ product }: { 
    product: Product
}) {
    return (
    <PopUpModalComponent
    content={onClose => 
        <AnalyticsLoader 
        productId={product.id}
        render={(productAnalytics) => (
            <Modal 
            product={productAnalytics} 
            onClose={onClose} 
            />
        )}
        />
    }>
        <AdminSummaryInfo product={product} />
    </PopUpModalComponent>
  );
}

function Modal({ product, onClose }: { 
    product: ProductAnalytics 
    onClose: () => void
}) {
    const [tog, setTog] = useState(false);
    return (
    <div>
        { tog ? 
        <AnalyticsInfo product={product} />
            :
        <UpdateForm
        product={product}
        onSuccess={() => setTog(false)}
        />
        }

        <button 
        type="button"
        onClick={() => setTog(!tog)}
        >
            Edit
        </button>
        
        <DeleteButton
        productId={product.id}
        onClick={onClose}
        />
    </div>
    )
}