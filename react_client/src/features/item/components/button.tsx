
import { useEffect, useState } from 'react';
import { PopUpModalComponent } from '@/shared/PopUpModalComponent';
import { 
    ShoppingCartOutlineIcon, 
    ShoppingCartSolidIcon,
    MinusIcon,
    PlusIcon
} from "@/shared"

import { useCartState } from '../service';

import { CartModal } from './modal';
import type { Product } from '../index';


export {
    CartButton, 
    AddToCartButton
}


function CartButton({onCheckoutClick}:{
    onCheckoutClick: () => void
}) {
    const isEmpty = useCartState(state => state.isEmpty())
    
    if (isEmpty) return (
        <ShoppingCartOutlineIcon />
    )
    else return (
        <PopUpModalComponent
        content={onClose => 
            <CartModal 
            onClose={onClose}
            onCheckoutClick={onCheckoutClick}
            />
        }>
            <ShoppingCartSolidIcon />
        </PopUpModalComponent>
    )
}

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
		<div>
            <MinusIcon
            onClick={() => cartState.addQuantity(product, -1)} />

            <input
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            onBlur={() => 
                cartState.updateQuantity(product, Number(quantity))
            } 
            type="number"
            placeholder="quantity"
            />

			<PlusIcon
            onClick={() => cartState.addQuantity(product, 1)} 
            />
		</div>
	)
}