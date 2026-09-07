import { listToRecord } from "@/utils/funcs";
import {
    ChevronDownIcon,
    Display,
    Loading
} from "@/shared"
import { PopUpModalComponent } from '@/shared/PopUpModalComponent';
import { 
    NumberEditField, 
    SelectEditComponent, 
    TextEditField 
} from "@/shared/SelectEditComponent"


import type { 
    AdminSearchParams 
} from "../schema"
import { 
    useAdminSearchParams,
    useAdminSearchQuery, 
    useAdminSelectEdit, 
    useSaleQuery 
} from "../service"
import { SaleCarousel } from "./media"

import { SaleRow } from "./card"
import { AdminQueryParmsComponent } from "./component"
import { CreateSaleModal } from "./modal"

export {
    SaleDisplay,
    AdminSearchDisplay,
}


function SaleDisplay({ saleSlug }: { 
    saleSlug: string | undefined
}) {

    const {data: sale, isError} = useSaleQuery(saleSlug)
    if (!sale) return <Loading isError={isError} />

    return (
        <div className="rounded border border-slate-200 bg-white p-4">
            <h1 className="text-lg font-semibold">
                {sale.name}
            </h1>

            <SaleCarousel saleId={sale.id} limit={20} />

            <h2 className="text-lg font-semibold">
                {sale.discountPerc}% off!
            </h2>
            <p className="text-sm text-slate-600">
                {sale.startAt} to {sale.endAt}
            </p>
            <p className="text-sm text-slate-600">
                {sale.description}
            </p>
        </div>
    )
}

function AdminSearchDisplay({limit}: {
    limit: number
}) {

    const searchParams = useAdminSearchParams()
    const { activation, getParams, search } =
    searchParams;

	const { data, fetchNextPage, hasNextPage } = useAdminSearchQuery(
        limit, getParams() as AdminSearchParams,
	);
	const sales = data?.pages.flatMap(page => page.sales) ?? [];

	const selectEdit = useAdminSelectEdit(sales)


	const title = search.get()
		? `Searching: ${search.get()}`
		: activation.get().join(', ') || 'All Sales';

	return (
		<Display>
			<AdminQueryParmsComponent params={searchParams} />

			<h1>{title}</h1>

			<PopUpModalComponent
			content={onClose => 
                <CreateSaleModal onClose={onClose} />
            }>
				<span>Create sale</span>
			</PopUpModalComponent>

			<SelectEditComponent
            fieldComponents={
                <>
                    <TextEditField field={selectEdit.startAt} />
                    <TextEditField field={selectEdit.endAt} />
                    <NumberEditField field={selectEdit.discountPercent} />
                </>
            }
            itemComponents={listToRecord(sales, sale => [
                String(sale.id), 
                <SaleRow 
                key={sale.id} 
                sale={sale} 
                />
            ])}
            useSelectEdit={selectEdit}
			/>
            
            <ChevronDownIcon
            hidden={hasNextPage}
            onClick={() => fetchNextPage()}
            />
		</Display>
	);
}