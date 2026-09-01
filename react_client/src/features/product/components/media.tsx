
import {
    MediaCarouselComponent,
    ImportButton,
    downloadCsv,
} from "../index"

import { 
    useProductMediasQuery,
    useExportProductsMutation,
    useImportProductsMutation,
} from "../service"


export {
    ProductMediaCarouselComponent,
    ImportProductsButton,
    ExportProductsButton,
}

function ProductMediaCarouselComponent({
    productId,
    limit = 1,
}: {
    productId: number
    limit?: number
}) {
    const { data: media } = useProductMediasQuery(productId)

    return (
        <MediaCarouselComponent
            media={media ?? []}
            limit={limit}
        />
    )
}

function ImportProductsButton() {
	const mutation = useImportProductsMutation()

	return (
		<ImportButton
			label="Import Products"
			isPending={mutation.isPending}
			onFileSelected={(file: File) => mutation.mutate(file)}
		/>
	)
}

function ExportProductsButton() {
	const mutation = useExportProductsMutation()

	return (
		<button
			type="button"
			disabled={mutation.isPending}
			onClick={() => void downloadCsv(
				mutation.mutateAsync,
				"products.csv",
			)}
		>
			{mutation.isPending ? "Exporting..." : "Export Products"}
		</button>
	)
}
