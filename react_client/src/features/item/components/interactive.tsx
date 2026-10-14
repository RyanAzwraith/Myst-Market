

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
        <ShoppingCartOutlineIcon />
    )
    else return (
        <ModalTrigger
		dropdown={true}
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
    <div className="space-y-4">
        <div className="flex items-center justify-between">
            <Heading level={2} className="text-xl">Cart</Heading>
            <Button
            variant="ghost"
            className="px-2 py-1 text-sm text-gray-500"
            onClick={() => {
                cartState.clearCart()
                onClose()
            }}>
                Clear
            </Button>
        </div>

        <div className="max-h-80 space-y-3 overflow-y-auto">
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

        <div className="flex items-center justify-between border-t border-gray-200 pt-3">
            <span className="text-sm font-medium text-gray-600">Total</span>
            <span className="font-semibold text-gray-900">
                <MoneyFormat amount={cartState.getTotal()} />
            </span>
        </div>

        <Button
        className="w-full"
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
            className="self-center px-3 py-1.5 text-sm"
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
	    "flex w-fit self-center overflow-hidden rounded-lg border " +
	    "border-gray-300 bg-white shadow-sm"
	}
	>
	    <MinusIcon
	    className="h-5 w-5 text-gray-600"
	    buttonClassName={
	        "flex h-9 w-9 items-center justify-center " +
	        "border-r border-gray-300 transition hover:bg-gray-100"
	    }
        onClick={e => {
            e.stopPropagation(); 
            cartState.addQuantity(product, -1)}
        } />

        <Input
        type="number"
        placeholder="quantity"
        value={quantity}
        className="h-9 w-12 border-0 px-1 py-0 text-center text-sm 
            font-semibold focus:outline-none focus:ring-0"
        onChange={e => {
            e.stopPropagation();
            setQuantity(e.target.value)
        }}
        onBlur={() => 
            cartState.updateQuantity(product, Number(quantity))
        } 
        />

        <PlusIcon
        className="h-5 w-5 text-gray-600"
        buttonClassName={
            "flex h-9 w-9 items-center justify-center " +
            "border-l border-gray-300 transition hover:bg-gray-100"
        }
        onClick={e => {
            e.stopPropagation();
            cartState.addQuantity(product, 1)
        }} 
        />
    </div>
	)
}
