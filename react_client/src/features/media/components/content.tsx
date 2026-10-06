
import { 
	Carousel, 
	Loading, 
	Img,
	Vid, 
} from "@/shared"

import type { 
	MediaDetail,
} from "../schema"
import { 
	mediaType 
} from "../schema"


export {
	Image,
	Video,
	Media,
	MediaCarousel,
}


function Image({ media }: {
	media: MediaDetail | undefined
}) {
	if (!media) return <Loading />
	if (media.mediaType !== mediaType.image) return null
	return (
		<Img
		src={media.mediaUrl}
		alt={media.altText ?? ""}
		/>
	)
}

function Video({media}: {
	media: MediaDetail | undefined
}) {
	if (!media) return null
	if (media.mediaType !== mediaType.video) return null
	return (
		<Vid
		src={media.mediaUrl}
		controls
		playsInline
		aria-label={media.altText ?? media.mediaUrl}
		/>
	)
}

function Media({ media }: {
	media?: MediaDetail
}) {
	if (!media) return null
	if (media.mediaType === mediaType.image) return (
		<Image media={media} />
	)
	if (media.mediaType === mediaType.video) return (
		<Video media={media} />
	)
	return null
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
		<Carousel
		limit={limit}
		content={media.map(item => (
			<Media
			key={item.id}
			media={item}
			/>
		))}
		/>
	)
}