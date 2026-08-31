
import { useId, useRef, type ChangeEvent } from "react"

import { CarouselComponent } from "@/shared/CarouselComponent"

import type { MediaDetail } from "./mediaSchema"
import { MediaType } from "./mediaSchema"
import {
	useExportProductsMutation,
	useExportSalesMutation,
	useImportProductsMutation,
	useImportSalesMutation,
	useProductMediaQuery,
	useSaleMediaQuery,
} from "./mediaService"

function MediaImageComponent({
	media,
}: {
	media: MediaDetail
}) {
	if (media.mediaType !== MediaType.IMAGE) return null

	return (
		<img
			src={media.mediaUrl}
			alt={media.altText ?? ""}
			className="max-h-96 max-w-full object-contain"
		/>
	)
}

function MediaVideoComponent({
	media,
}: {media: MediaDetail}) {
	if (media.mediaType !== MediaType.VIDEO) return null

	return (
		<video
			src={media.mediaUrl}
			className="max-h-96 max-w-full object-contain"
			controls
			playsInline
			aria-label={media.altText ?? media.mediaUrl}
		/>
	)
}

function MediaComponent({
	media,
}: {media: MediaDetail}) {
	if (media.mediaType === MediaType.IMAGE) {
		return <MediaImageComponent media={media} />
	}

	return <MediaVideoComponent media={media} />
}

function MediaCarouselComponent({
	media,
	limit = 1,
}: {
	media: MediaDetail[]
	limit?: number
}) {
	if (media.length === 0) return null

	return (
		<CarouselComponent
			limit={limit}
			children={media.map(item => (
				<MediaComponent
					key={item.id}
					media={item}
				/>
			))}
		/>
	)
}

function ProductMediaCarouselComponent({
	productId,
	limit = 1,
}: {
	productId: number
	limit?: number
}) {
	const { data: media } = useProductMediaQuery(productId)

	return (
		<MediaCarouselComponent
			media={media ?? []}
			limit={limit}
		/>
	)
}

function SaleMediaCarouselComponent({
	saleId,
	limit = 1,
}: {
	saleId: number
	limit?: number
}) {
	const { data: media } = useSaleMediaQuery(saleId)

	return (
		<MediaCarouselComponent
			media={media ?? []}
			limit={limit}
		/>
	)
}

function ImportButton({
	label,
	isPending,
	onFileSelected,
}: {
	label: string
	isPending: boolean
	onFileSelected: (file: File) => void
}) {
	const inputRef = useRef<HTMLInputElement>(null)
	const inputId = useId()

	function handleChange(event: ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0]
		if (file) onFileSelected(file)
		event.target.value = ""
	}

	return (
		<>
			<button
				type="button"
				disabled={isPending}
				aria-controls={inputId}
				onClick={() => inputRef.current?.click()}
			>
				{isPending ? "Importing..." : label}
			</button>
			<input
				ref={inputRef}
				id={inputId}
				type="file"
				accept=".csv,text/csv"
				className="hidden"
				onChange={handleChange}
			/>
		</>
	)
}

function ImportProductsButton() {
	const mutation = useImportProductsMutation()

	return (
		<ImportButton
			label="Import Products"
			isPending={mutation.isPending}
			onFileSelected={file => mutation.mutate({ file })}
		/>
	)
}

function ImportSalesButton() {
	const mutation = useImportSalesMutation()

	return (
		<ImportButton
			label="Import Sales"
			isPending={mutation.isPending}
			onFileSelected={file => mutation.mutate({ file })}
		/>
	)
}

async function downloadCsv(
	exportFile: () => Promise<Blob>,
	fileName: string,
) {
	const blob = await exportFile()
	const url = URL.createObjectURL(blob)
	const link = document.createElement("a")
	link.href = url
	link.download = fileName
	link.click()
	URL.revokeObjectURL(url)
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

export {
	MediaImageComponent,
	MediaVideoComponent,
	MediaComponent,
	MediaCarouselComponent,
	ProductMediaCarouselComponent,
	SaleMediaCarouselComponent,
	ImportProductsButton,
	ExportProductsButton,
	ImportSalesButton,
	ExportSalesButton,
}
