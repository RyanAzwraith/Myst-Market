

import { ShoppingCartIcon as OutlineIcon } from "@heroicons/react/24/outline";
import { ShoppingCartIcon as SolidIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";
import { XMarkIcon } from "@heroicons/react/24/solid";

import { PopUpModalComponent } from "@/shared/PopUpModalComponent"
import { ToggleComponent } from "@/shared/ToggleComponent"
import { formatMoney } from "@/utils/formatMoney"
import { ImageComponent } from "@/shared/ImageComponent";
import { AppRoutes } from "@/AppRoutes";
import { useCartState } from "./CartService";
import type { CartItem } from "./cartSchemas";

function CartButtonComponent() {
    const isEmpty = useCartState(state => state.isEmpty())
	
    return (
        <PopUpModalComponent
        content={onClose => <CartModalContent onClose={onClose}/>}
        >
            <ToggleComponent
            state={isEmpty}
            onChild={
                <OutlineIcon 
                aria-label="OutlineIcon"
                aria-hidden="false"
                className="h-6 w-6"
                />
            }
            offChild={
                <SolidIcon
                aria-label="SolidIcon"
                aria-hidden="false"
                className="h-6 w-6" 
                />
            } />
        </PopUpModalComponent>
    )
}

function CartModalContent(props:{
	onClose: () => void
}) {
	const navigate = useNavigate();
	const cartState = useCartState()
	
	return (
		<>
			<h1>Cart</h1>

			<button onClick={() => {
				cartState.clearCart()
				props.onClose()
			}}>
				Clear
			</button>

            <div>
                { cartState.items.map(item => 
                    <CardItemCard cartItem={item} />
                )}
            </div>

            <p>{formatMoney(cartState.getTotal())}</p>

			<button onClick={() => {
				props.onClose()
				navigate(AppRoutes.checkout)
			}}>
				Checkout
			</button>
		</>
	)

}

function CardItemCard(
    { cartItem }: 
    { cartItem: CartItem }
) {
    const navigate = useNavigate()
    const cartState = useCartState()
    const product = cartItem.product
    return (
        <div 
        className="rounded border border-slate-200 bg-white p-3 shadow-sm">
            
            <div
            onClick={() => {navigate(`${AppRoutes.product}/${product.slug}`)}}>
                <ImageComponent altText={product.name}/>
            </div>
            
            <h2 className="mt-2 font-semibold">{product.name}</h2>
            
            <p>{formatMoney(product.priceAudCent)}</p>
            
            <input
            value={cartItem.quantity}
            onChange={(e) => 
                cartState.updateQuantity(product, Number(e.target.value))
            }
            type="text"
            className="w-full border p-2"
            placeholder="quantity"/>
            
            <p>{formatMoney(product.priceAudCent * cartItem.quantity)}</p>
            
            <XMarkIcon
            aria-label="XMarkIcon"
            aria-hidden="false"
            className="h-6 w-6" 
            onClick={() => cartState.removeItem(product) } />

        </div>
    )
}

export { CartButtonComponent }
