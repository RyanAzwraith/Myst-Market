

import {
    ImportButton,
    downloadCsv,
} from "../index"

import { 
    useExportSalesMutation,
    useImportSalesMutation,
} from "../service"


export {
    ImportSalesButton,
    ExportSalesButton,
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