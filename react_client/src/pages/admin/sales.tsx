import { useState } from "react";
import { Button, Span, Heading, LoadContent } from "@/shared";

import { 
    Page,
    ModalTrigger
} from "@/shared";

import { ItemRow, SelectEditDisplay } from "@/hooks/SelectEdit";
import { 
    QueryParamFields 
} from "@/hooks/QueryParams";

import { 
    type SaleAnalytics,
    AdminSearchTitle,
    AdminSummaryInfo,
    AdminSearchLoader,
    CreateForm,
    AnalyticsInfo,
    DeleteButton,
    UpdateForm
} from "@/features/sale"


export { SalesPage }


function SalesPage() {
    return (
    <Page className="min-h-screen bg-slate-50 px-4 py-8">
        <ModalTrigger
        className={
            "rounded-lg bg-blue-600 px-4 py-2 font-medium text-white " +
            "shadow-sm transition hover:bg-blue-500"
        }
        modalClassName="max-h-[90vh] overflow-y-auto"
        button={
            <Span>Create sale</Span>
        }
        render={onClose => 
        <>
            <Heading level={2} className="mb-4 text-xl">
                Create Sale
            </Heading>
            <CreateForm
            onSuccess={onClose}
            className="space-y-3"
            />
        </>
        }/>

        <AdminSearchLoader
        limit={20}
        render={({searchQuery, searchParams, selectEdit, sales}) => <>
            <QueryParamFields queryParams={searchParams} />
            <AdminSearchTitle adminSearchParams={searchParams} />

            <SelectEditDisplay
            selectEdit={selectEdit}
            />

            <LoadContent
            className="space-y-3"
            hasMore={!searchQuery.hasNextPage}
            onClick={searchQuery.fetchNextPage}
            content={(sales ?? []).map(s => 
                <ItemRow
                key={s.id}
                id={s.id}
                selectEdit={selectEdit}
                >
                    <ModalTrigger
                    className={
                        "block w-full rounded-lg text-left transition " +
                        "hover:bg-gray-50"
                    }
                    modalClassName="max-h-[90vh] overflow-y-auto"
                    button={
                        <AdminSummaryInfo sale={s} />
                    }
                    render={onClose => 
                        <SaleModal 
                        sale={s} 
                        onClose={onClose} 
                        />
                    } />
                </ItemRow>
            )}/>
        </> } />
    </Page>
    )
}

function SaleModal({ sale, onClose }: { 
    sale: SaleAnalytics 
    onClose: () => void
}) {
    const [tog, setTog] = useState(true);
    return (
    <div className="space-y-5 text-gray-900">
        { tog ? 
        <AnalyticsInfo sale={sale} />
            :
        <UpdateForm
        sale={sale}
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
            saleId={sale.id}
            onClick={onClose}
            />
        </div>
    </div>
    )
}