

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

import { useCartState } from '../state';

import type { Product } from '../index';

import { List } from "@/shared"

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
        <ShoppingCartOutlineIcon className="cart-menu-button" />
    )
    else return (
        <ModalTrigger
		dropdown={true}
        mobileFullScreen
        wrapperClassName="cart-menu-button"
        button={
            <ShoppingCartSolidIcon className="cart-menu-button" />
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
    <div className="cart-menu">
        <div className="cart-header">
            <Heading level={2} className="cart-title">Cart</Heading>
            <div className="cart-header-actions">
                <Button
                variant="ghost"
                className="cart-clear-button"
                onClick={() => {
                    cartState.clearCart()
                    onClose()
                }}>
                    Clear
                </Button>
                <Button
                variant="secondary"
                className="cart-close-button"
                onClick={onClose}>
                    Close
                </Button>
            </div>
        </div>

        <div className="cart-items">
            <List
            items={cartState.items}
            render={item => 
                <ItemCard 
                key={item.product.name} 
                item={item} 
                />
            }
            />
        </div>

        <div className="cart-total">
            <span className="cart-total-label">Total</span>
            <span className="cart-total-value">
                <MoneyFormat amount={cartState.getTotal()} />
            </span>
        </div>

        <Button
        className="cart-checkout-button"
        onClick={() => {
            onClose()
            onCheckoutClick()
        }}>
            Checkout
        </Button>
    </div>
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
            className="add-to-cart-button"
                onClick={e => {
                    e.stopPropagation();
                    cartState.addQuantity(product, 1)
                }}>
                    Add to Cart
            </Button>
        )
    
	return (
    <div
	className={
	    "add-to-cart-quantity"
	}
	>
	    <MinusIcon
	    className="quantity-icon"
	    buttonClassName="quantity-decrease-button"
        onClick={e => {
            e.stopPropagation(); 
            cartState.addQuantity(product, -1)}
        } />

        <Input
        type="number"
        placeholder="quantity"
        value={quantity}
        className="quantity-input"
        onChange={e => {
            e.stopPropagation();
            setQuantity(e.target.value)
        }}
        onBlur={() => 
            cartState.updateQuantity(product, Number(quantity))
        } 
        />

        <PlusIcon
        className="quantity-icon"
        buttonClassName="quantity-increase-button"
        onClick={e => {
            e.stopPropagation();
            cartState.addQuantity(product, 1)
        }} 
        />
    </div>
	)
}
