

import { ShoppingCartIcon as OutlineIcon } from "@heroicons/react/24/outline";
import { ShoppingCartIcon as SolidIcon } from "@heroicons/react/24/solid";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";

import { PopUpModalComponent } from "@/shared/PopUpModalComponent"
import { ToggleComponent } from "@/shared/ToggleComponent"
import { formatMoney } from "@/utils/formatMoney"
import { PageRoutes } from "@/PageRoutes";

import { ProductMediaCarouselComponent } from "../index";

import { useCartState } from "../service";
import type { Item } from "../schema";
import { AddToCartButton } from "./AddToCartButton";

function CartButtonComponent() {
    const isEmpty = useCartState(state => state.isEmpty())
	
    return (
        <ToggleComponent
		state={isEmpty}
		onChild={
            <OutlineIcon 
            aria-label="outlinecarticon"
            aria-hidden="false"
            className="h-6 w-6"
            />
		}
		offChild={
			<PopUpModalComponent
			content={onClose => <CartModalContent onClose={onClose}/>}
			>
                <SolidIcon
                aria-label="solidcarticon"
                aria-hidden="false"
                className="h-6 w-6" 
                />
			</PopUpModalComponent>
		}
		/>
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
                    <CardItemCard key={item.product.name} cartItem={item} />
                )}
            </div>

            <p>{formatMoney(cartState.getTotal())}</p>

			<button onClick={() => {
				props.onClose()
				navigate(PageRoutes.checkout)
			}}>
				Checkout
			</button>
		</>
	)

}

function CardItemCard(
    { cartItem }: 
    { cartItem: Item }
) {
    const navigate = useNavigate()
    const cartState = useCartState()
    const product = cartItem.product
    return (
        <div 
        className="rounded border border-slate-200 bg-white p-3 shadow-sm"
        >
            
            <div
            onClick={() => {navigate(`${PageRoutes.product}/${product.slug}`)}}
            >
                <ProductMediaCarouselComponent productId={product.id} limit={1} />
                <h2 className="mt-2 font-semibold">{product.name}</h2>
            </div>
            
            <p
            className={cartItem.onSale ? "bg-red-200" : ""}
            >
                {formatMoney(cartItem.priceCent)}
            </p>
            
            <AddToCartButton product={product}/>
            
            <p
            className={cartItem.onSale ? "bg-red-200" : ""}
            >
                {formatMoney(cartItem.priceCent * cartItem.quantity)}
            </p>
            
            <XMarkIcon
            aria-label="xmarkicon"
            aria-hidden="false"
            className="h-6 w-6" 
            onClick={() => cartState.removeItem(product) } 
            />

        </div>
    )
}

export { 
    CartButtonComponent,
    CartModalContent,
    CardItemCard,
}
