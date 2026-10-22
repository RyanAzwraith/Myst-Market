import { useState } from "react";

import { 
    Page,
    ModalTrigger, 
    Button,
    Heading,
    Span,
    LoadContent
} from "@/shared";

import { 
    ItemRow,
    SelectEditDisplay 
} from "@/hooks/SelectEdit/components";
import { 
    QueryParamFields 
} from "@/hooks/QueryParams";

import { 
    type ProductAnalytics,
    type Product,
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
    <Page className="products-page admin-page">
        <ModalTrigger
        className="admin-create-trigger"
        modalClassName="admin-modal-dialog"
        button={ 
            <Span>Create product</Span> 
        }
        render={onClose => 
        <>
            <Heading level={2} className="admin-modal-title">
                Create Product
            </Heading>
            <CreateForm
            onSuccess={onClose}
            className="admin-form"
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
            />

            <LoadContent
            className="admin-product-list"
            hasMore={searchQuery.hasNextPage}
            onClick={searchQuery.fetchNextPage}
            content={(products ?? []).map(p => 
                <ItemRow
                key={p.id}
                id={p.id}
                selectEdit={selectEdit}
                >
                    <ModalTrigger
                    className="admin-product-trigger"
                    modalClassName="admin-modal-dialog"
                    button={
                        <AdminSummaryInfo product={p} />
                    }
                    render={onClose => 
                        <ProductModal 
                        product={p} 
                        onClose={onClose} 
                        />
                    } />
                </ItemRow>
            )}/>
        </> } />
    </Page>
    )
}

function ProductModal({ product, onClose }: { 
    product: Product
    onClose: () => void
}) {
    const [tog, setTog] = useState(true);
    return (
    <div className="product-modal admin-modal">
        { tog ? 
        <AnalyticsInfo productId={product.id} />
            :
        <UpdateForm
        product={product}
        onSuccess={() => setTog(false)}
        className="admin-form"
        />
        }

        <div className="admin-modal-actions">
            <Button 
            type="button"
            onClick={() => setTog(!tog)}
            >
                {tog ? "Edit" : "View details"}
            </Button>
            
            <DeleteButton
            productId={product.id}
            onClick={onClose}
            />
        </div>
    </div>
    )
}