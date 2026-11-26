
import { 
	Carousel, 
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


function Image({ media, className }: {
	media: MediaDetail | undefined
	className?: string
}) {
	if (!media) return <Img className="media-image" alt="Image unavailable" />
	if (media.mediaType !== mediaType.image) return null
	return (
		<Img
		src={media.mediaUrl}
		alt={media.altText ?? ""}
		className={`media-image ${className ?? ""}`}
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
		className="media-video"
		controls
		playsInline
		aria-label={media.altText ?? media.mediaUrl}
		/>
	)
}

function Media({ media, className }: {
	media?: MediaDetail
	className?: string
}) {
	if (!media) return 	<Img className="media-content" alt="Image unavailable" />
	if (media.mediaType === mediaType.image) return (
		<Image
		media={media}
		className={`media-content ${className ?? ""}`}
		/>
	)
	if (media.mediaType === mediaType.video) return (
		<Video media={media} />
	)
	return null
}

function MediaCarousel({
	media,
	limit = 1,
	className,
	imageClassName,
}: {
	media: MediaDetail[]
	limit?: number
	className?: string
	imageClassName?: string
}) {
	if (media.length === 0) return null

	return (
		<Carousel
		limit={limit}
		className={`media-carousel ${className ?? ""}`}
		content={media.map(item => (
			<Media
			key={item.id}
			media={item}
			className={imageClassName}
			/>
		))}
		/>
	)
}