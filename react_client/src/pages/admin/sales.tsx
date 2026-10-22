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
    <Page className="sales-page admin-page">
        <ModalTrigger
        className="admin-create-trigger"
        modalClassName="admin-modal-dialog"
        button={
            <Span>Create sale</Span>
        }
        render={onClose => 
        <>
            <Heading level={2} className="admin-modal-title">
                Create Sale
            </Heading>
            <CreateForm
            onSuccess={onClose}
            className="admin-form"
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
            className="admin-sale-list"
            hasMore={searchQuery.hasNextPage}
            onClick={searchQuery.fetchNextPage}
            content={(sales ?? []).map(s => 
                <ItemRow
                key={s.id}
                id={s.id}
                selectEdit={selectEdit}
                >
                    <ModalTrigger
                    className="admin-sale-trigger"
                    modalClassName="admin-modal-dialog"
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
    <div className="sale-modal admin-modal">
        { tog ? 
        <AnalyticsInfo sale={sale} />
            :
        <UpdateForm
        sale={sale}
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
            saleId={sale.id}
            onClick={onClose}
            />
        </div>
    </div>
    )
}