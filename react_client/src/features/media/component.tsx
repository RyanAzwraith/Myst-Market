import { CarouselComponent } from "@/shared/CarouselComponent"

import type { 
	MediaDetail,
} from './schema'
import { 
	MediaType 
} from "./schema"
import { useId, useRef, type ChangeEvent } from "react"
import { Button } from "@/shared/elements/button"

export {
	Image,
	Video,
	Media,
	MediaCarousel,
	ImportButton,
	ExportButton,
}

const Image = ({media}: {media: MediaDetail}) =>
	<img
	src={media.mediaUrl}
	alt={media.altText ?? ""}
	className="max-h-96 max-w-full object-contain"
	/>

const Video = ({media}: {media: MediaDetail}) =>
	<video
	src={media.mediaUrl}
	className="max-h-96 max-w-full object-contain"
	controls
	playsInline
	aria-label={media.altText ?? media.mediaUrl}
	/>

function Media({
	media,
}: {media: MediaDetail}) {
	if (media.mediaType === MediaType.IMAGE) return (
		<Image media={media} />
	)
	else if (media.mediaType === MediaType.VIDEO) return (
		<Video media={media} />
	)
	else return null
}

function MediaCarousel({
	medias, limit = 1,
}: {
	medias: MediaDetail[] | undefined
	limit?: number
}) {
	if (!medias || medias.length === 0) return null
	return (
		<CarouselComponent
		limit={limit}
		children={medias.map(item => (
			<Media
			key={item.id}
			media={item}
			/>
		))}
		/>
	)
}

function ImportButton({
	label, isPending, onFileSelected,
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

async function ExportButton({
	isPending, exportFile, fileName = "export.csv",
}: {
	isPending: boolean, 
	exportFile: () => Promise<Blob>,
	fileName?: string,
}) {
	const handleClick = async () => {
		const blob = await exportFile()
		const url = URL.createObjectURL(blob)
		const link = document.createElement("a")
		link.href = url
		link.download = fileName
		link.click()
		URL.revokeObjectURL(url)
	}

	return (
		<Button
		disabled={isPending}
		onClick={handleClick}
		>
			{isPending ? "Exporting..." : "Export Products"}
		</Button>
	)
}