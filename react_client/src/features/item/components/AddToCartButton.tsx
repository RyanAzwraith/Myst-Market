import { MinusIcon, PlusIcon } from "@heroicons/react/24/solid";
import { useState, useEffect } from "react";

import type { Product } from "../index";

import { useCartState } from "../service";

function AddToCartButton({ product }: { 
    product: Product 
}) {
	const cartState = useCartState()
    const cartItem = cartState.getCartItem(product)

    const [quantity, setQuantity] = useState("")
    
    useEffect(() => {
        setQuantity(String(cartItem?.quantity ?? 1));
    }, [cartItem?.quantity])

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
            aria-label="minusicon"
            aria-hidden="false"
            className="h-6 w-6"
            onClick={() => cartState.addQuantity(product, -1)} />

            <input
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            onBlur={() => 
                cartState.updateQuantity(product, Number(quantity))
            } 
            type="number"
            className="w-full border p-2"
            placeholder="quantity"
            />

			<PlusIcon
            aria-label="plusicon"
            aria-hidden="false"
            className="h-6 w-6" 
            onClick={() => cartState.addQuantity(product, 1)} 
            />
		</>
	)
}

export {AddToCartButton}