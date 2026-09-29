import { List, Modal } from "@/shared"
import { formatMoney } from "@/utils/formatMoney"

import { useCartState } from "../service"
import { ItemWithXCard } from "./card"


export {    
    CartModal,
}

function CartModal({onClose, onCheckoutClick}:{
	onClose: () => void
	onCheckoutClick: () => void
}) {
	const cartState = useCartState(state => state)
	return (
		<Modal>
			<h1>Cart</h1>
        
			<button onClick={() => {
				cartState.clearCart()
				onClose()
			}}>
				Clear
			</button>

            <List
            items={cartState.items}
            renderItem={item => 
                <ItemWithXCard 
                key={item.product.name} 
                item={item} 
                />
            }
            />

            <p>{formatMoney(cartState.getTotal())}</p>

			<button onClick={() => {
				onClose()
				onCheckoutClick()
			}}>
				Checkout
			</button>
		</Modal>
	)

}