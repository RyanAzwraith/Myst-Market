

import { useEffect, useState } from 'react';
import { ModalTrigger } from '@/shared/composition/ModalTrigger';
import { 
    ShoppingCartOutlineIcon, 
    ShoppingCartSolidIcon,
    MinusIcon,
    PlusIcon,
    Heading,
    Button,
    MoneyFormat,
    Input
} from "@/shared"

import { useCartState } from '../hook';

import type { Product } from '../index';

import { List, Menu } from "@/shared"

import { 
    ItemCard,
} from "./composition"


export {    
    CartMenuButton, 
    CartMenu,
    AddToCartButton,
}


function CartMenuButton({onCheckoutClick}:{
    onCheckoutClick: () => void
}) {
    const isEmpty = useCartState(state => state.isEmpty())
    
    if (isEmpty) return (
        <ShoppingCartOutlineIcon />
    )
    else return (
        <ModalTrigger
        button={
            <ShoppingCartSolidIcon />
        }
        render={onClose => 
            <CartMenu 
            onClose={onClose}
            onCheckoutClick={onCheckoutClick}
            />
        } />
    )
}

function CartMenu({onClose, onCheckoutClick}:{
	onClose: () => void
	onCheckoutClick: () => void
}) {
	const cartState = useCartState(state => state)
	return (
    <Menu>
        <Heading level={1}>Cart</Heading>
    
        <Button onClick={() => {
            cartState.clearCart()
            onClose()
        }}>
            Clear
        </Button>

        <List
        items={cartState.items}
        render={item => 
            <ItemCard 
            key={item.product.name} 
            item={item} 
            />
        }
        />

        <MoneyFormat amount={cartState.getTotal()} />

        <Button onClick={() => {
            onClose()
            onCheckoutClick()
        }}>
            Checkout
        </Button>
    </Menu>
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
            <Button 
            onClick={() => cartState.addQuantity(product, 1)}>
                Add to Cart
            </Button>
        )
    
	return (
    <div>
        <MinusIcon
        onClick={() => cartState.addQuantity(product, -1)} />

        <Input
        type="number"
        placeholder="quantity"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        onBlur={() => 
            cartState.updateQuantity(product, Number(quantity))
        } 
        />

        <PlusIcon
        onClick={() => cartState.addQuantity(product, 1)} 
        />
    </div>
	)
}
