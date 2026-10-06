import { useState } from "react";

import { listToRecord } from "@/utils/funcs";
import { 
    ChevronDownIcon,
    Page,
    ModalTrigger, 
    Button,
    Heading,
    Span
} from "@/shared";

import { 
    SelectEditDisplay 
} from "@/hooks/SelectEdit/components";
import { 
    QueryParamFields 
} from "@/hooks/QueryParams";

import { 
    type ProductAnalytics,
    AdminSearchTitle,
    AdminSummaryInfo,
    AdminSearchLoader,
    CreateForm,
    AnalyticsInfo,
    DeleteButton,
    UpdateForm
} from "@/features/product"


export { ProductsPage }


function ProductsPage() {
    return (
    <Page>
        <ModalTrigger
        button={ 
            <Span>Create product</Span> 
        }
        render={onClose => 
        <>
            <Heading level={2}>Create Product</Heading>
            <CreateForm
            onSuccess={onClose}
            />
        </>
        }/>

        <AdminSearchLoader
        limit={20}
        render={({searchQuery, searchParams, selectEdit, products}) => <>
            <QueryParamFields queryParams={searchParams} />
            <AdminSearchTitle adminSearchParams={searchParams} />

            <SelectEditDisplay
            selectEdit={selectEdit}
            elements={listToRecord(products, (p) => [String(p.id), 
                <ModalTrigger
                button={
                    <AdminSummaryInfo product={p} />
                }
                render={onClose => 
                    <ProductModal 
                    product={p} 
                    onClose={onClose} 
                    />
                } />
            ])}/>

            <ChevronDownIcon 
            onClick={searchQuery.fetchNextPage}
            hidden={!searchQuery.hasNextPage}
            />
        </> } />
    </Page>
    )
}

function ProductModal({ product, onClose }: { 
    product: ProductAnalytics 
    onClose: () => void
}) {
    const [tog, setTog] = useState(false);
    return (
    <>
        { tog ? 
        <AnalyticsInfo product={product} />
            :
        <UpdateForm
        product={product}
        onSuccess={() => setTog(false)}
        />
        }

        <Button 
        type="button"
        onClick={() => setTog(!tog)}
        >
            Edit
        </Button>
        
        <DeleteButton
        productId={product.id}
        onClick={onClose}
        />
    </>
    )
}