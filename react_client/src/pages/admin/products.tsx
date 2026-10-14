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
    <Page className="min-h-screen bg-slate-50 px-4 py-8">
        <ModalTrigger
        className={
            "rounded-lg bg-blue-600 px-4 py-2 font-medium text-white " +
            "shadow-sm transition hover:bg-blue-500"
        }
        modalClassName="max-h-[90vh] overflow-y-auto"
        button={ 
            <Span>Create product</Span> 
        }
        render={onClose => 
        <>
            <Heading level={2} className="mb-4 text-xl">
                Create Product
            </Heading>
            <CreateForm
            onSuccess={onClose}
            className="space-y-3"
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
            className="space-y-3"
            hasMore={searchQuery.hasNextPage}
            onClick={searchQuery.fetchNextPage}
            content={(products ?? []).map(p => 
                <ItemRow
                key={p.id}
                id={p.id}
                selectEdit={selectEdit}
                >
                    <ModalTrigger
                    className={
                        "block w-full rounded-lg text-left transition " +
                        "hover:bg-gray-50"
                    }
                    modalClassName="max-h-[90vh] overflow-y-auto"
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
    <div className="space-y-5 text-gray-900">
        { tog ? 
        <AnalyticsInfo productId={product.id} />
            :
        <UpdateForm
        product={product}
        onSuccess={() => setTog(false)}
        className="space-y-3"
        />
        }

        <div className="flex flex-wrap gap-2 border-t border-gray-200 pt-4">
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