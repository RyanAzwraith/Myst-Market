import { useState } from "react";
import { Button, Span, Heading } from "@/shared";

import { listToRecord } from "@/utils/funcs";
import { 
    ChevronDownIcon,
    Page,
    ModalTrigger
} from "@/shared";

import { SelectEditDisplay } from "@/hooks/SelectEdit";
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
    <Page>
        <ModalTrigger
        button={
            <Span>Create sale</Span>
        }
        render={onClose => 
        <>
            <Heading level={2}>Create Sale</Heading>
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
            elements={listToRecord(products, (s) => [s.id, 
                <ModalTrigger
                button={
                    <AdminSummaryInfo sale={s} />
                }
                render={onClose => 
                    <SaleModal 
                    sale={s} 
                    onClose={onClose} 
                    />
                }/>
            ])}/>

            <ChevronDownIcon 
            onClick={searchQuery.fetchNextPage}
            hidden={!searchQuery.hasNextPage}
            />
        </> } />
    </Page>
    )
}

function SaleModal({ sale, onClose }: { 
    sale: SaleAnalytics 
    onClose: () => void
}) {
    const [tog, setTog] = useState(false);
    return (
    <>
        { tog ? 
        <AnalyticsInfo sale={sale} />
            :
        <UpdateForm
        sale={sale}
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
        saleId={sale.id}
        onClick={onClose}
        />
    </>
    )
}