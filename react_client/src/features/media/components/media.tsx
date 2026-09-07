
import { useId, useRef, type ChangeEvent } from "react"

import { CarouselComponent } from "@/shared/CarouselComponent"

import type { 
	MediaDetail,
} from "../schema"
import { 
	mediaType 
} from "../schema"
import { Loading } from "@/shared/elements/text"

export {
	Image,
	Video,
	Media,
	MediaCarousel,
    ImportButton,
    downloadCsv,
}

function Image({ media }: {
	media: MediaDetail | undefined
}) {
	if (!media) return <Loading />
	
	if (media.mediaType !== mediaType.image) return null

	return (
		<img
			src={media.mediaUrl}
			alt={media.altText ?? ""}
			className="max-h-96 max-w-full object-contain"
		/>
	)
}

function Video({
	media,
}: {media: MediaDetail}) {
	if (media.mediaType !== mediaType.video) return null

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

function Media({
	media,
}: {media?: MediaDetail}) {
	if (!media) return null
	if (media.mediaType === mediaType.image) {
		return <Image media={media} />
	}

	return <Video media={media} />
}

function MediaCarousel({
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
				<Media
					key={item.id}
					media={item}
				/>
			))}
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
