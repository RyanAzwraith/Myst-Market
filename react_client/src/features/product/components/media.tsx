
import { Loading } from "@/shared"
import { 
    MediaCarousel,
    Image,
    downloadCsv,
    ImportButton
} from "../index"

import { 
    useProductMediasQuery,
    useProductImageQuery,
    useExportProductsMutation,
    useImportProductsMutation,
} from "../service"


export {
    ProductCarousel,
    ProductImage,
    ImportProductsButton,
    ExportProductsButton,
}


function ProductCarousel({
    productId,
    limit = 1,
}: {
    productId: number
    limit?: number
}) {
    const { data: media } = useProductMediasQuery(productId)

    return (
        <MediaCarousel
            media={media ?? []}
            limit={limit}
        />
    )
}

function ProductImage({ productId }: {
    productId: number
}) {
    const { data: media } = useProductImageQuery(productId)
    if (!media) return <Loading />
    return (
        <Image
        media={media}
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