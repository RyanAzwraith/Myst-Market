import { MinusIcon } from "@heroicons/react/24/outline";
import { PlusIcon } from "@heroicons/react/24/solid";

import type { ProductDetail } from "@/features/shop/shopSchemas";

import { useCartState } from "./CartService";

function AddToCartButton(
    { product }: 
    { product: ProductDetail }
) {
	const cartState = useCartState()

    const cartItem = cartState.getCartItem(product)

    if (!cartItem)
        return (
            <button 
            onClick={() => cartState.addQuantity(product, 1)}>
                Add to Cart
            </button>
        )

	return (
		<>
            <MinusIcon
            aria-label="SolidIcon"
            aria-hidden="false"
            className="h-6 w-6"
            onClick={() => cartState.addQuantity(product, 1)} 
            />
            <input
            value={cartItem.quantity}
            onChange={(e) => 
                cartState.updateQuantity(product, Number(e.target.value))
            }
            type="text"
            className="w-full border p-2"
            placeholder="quantity"
            />
			<PlusIcon
            aria-label="SolidIcon"
            aria-hidden="false"
            className="h-6 w-6" 
            onClick={() => cartState.addQuantity(product, -1)} 
            />
		</>
	)
}

export {AddToCartButton}