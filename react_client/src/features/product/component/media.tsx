
import { 
    Image,
    MediaCarousel
} from "@/features/media";

import type {  
    Product,
    ProductSummary,
} from "../schema";
import {  
    useProductImageQuery, 
    useProductMediasQuery,
} from "../service";

export { 
    ProductImage, 
    ProductLinkedImage,
    ProductMediasCarousel,
}

function ProductImage(
    {productId} : {productId: number}
) {
    const {data: media, isPending} = useProductImageQuery(productId);
    if (isPending) return null;
    if (!media) return null;
    return (
        <Image media={media} />
    )
}

function ProductLinkedImage({ 
    product, onClick
} : { 
    product: ProductSummary | Product,
    onClick: () => void
}) {
    return (
        <div
        onClick={onClick}
        >
            <ProductImage productId={product.id} />
            <h2 className="mt-2 font-semibold">{product.name}</h2>
        </div>
    )
}

function ProductMediasCarousel({
	productId, limit = 20,
}: {
	productId: number
	limit?: number
}) {
	const { data: medias } = useProductMediasQuery(productId);
    return (
		<MediaCarousel
			medias={medias}
			limit={limit}
		/>
	)
}
