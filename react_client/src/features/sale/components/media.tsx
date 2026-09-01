

import {
    MediaCarouselComponent,
    ImportButton,
    downloadCsv,
} from "../index"

import { 
    useSaleMediasQuery,
    useExportSalesMutation,
    useImportSalesMutation,
} from "../service"


export {
    SaleMediaCarouselComponent,
    ImportSalesButton,
    ExportSalesButton,
}


function SaleMediaCarouselComponent({
    saleId,
    limit = 1,
}: {
    saleId: number
    limit?: number
}) {
    const { data: media } = useSaleMediasQuery(saleId)

    return (
        <MediaCarouselComponent
            media={media ?? []}
            limit={limit}
        />
    )
}

function ImportSalesButton() {
	const mutation = useImportSalesMutation()

	return (
		<ImportButton
			label="Import Sales"
			isPending={mutation.isPending}
			onFileSelected={(file: File) => mutation.mutate(file)}
		/>
	)
}

function ExportSalesButton() {
	const mutation = useExportSalesMutation()

	return (
		<button
			type="button"
			disabled={mutation.isPending}
			onClick={() => void downloadCsv(
				mutation.mutateAsync,
				"sales.csv",
			)}
		>
			{mutation.isPending ? "Exporting..." : "Export Sales"}
		</button>
	)
}