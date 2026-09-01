import { useNavigate } from "react-router-dom";

import type {
    Field,
    TextField,
    BooleanField, 
} from "@/utils/useFormFields"
import {
    EmailFormField,
    FormFieldsContainer,
    TextFormField,
} from "@/shared/FormFieldsComponent"
import { formatMoney } from "@/utils/formatMoney"

import { PageRoutes } from "@/PageRoutes"

import type {
    ItemResolution
} from '../index'
import {
    useAuthState,
    useResolveQuery,
    itemSummary,
    ProductMediaCarouselComponent
} from '../index'

import {
    useCheckoutFormFields,
    useCreateMutation,
} from "../service"

export {
    CheckOutPage,
    UserComponent,
    CheckoutCartContent,
    CardItemCard,
}

function CheckOutPage() {
    const {data} = useResolveQuery()
    const createMutation = useCreateMutation()

    const {
        email, name, isCreatingAccount, country_code, postcode, state, city, street, deliveryNotes,
        reset, validate, setErrorMsg, errorMsg
    } = useCheckoutFormFields()
    
	async function handleSubmit (event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault()
        if (!validate()) return
        if (!data?.items) {
            setErrorMsg("Missing Cart Items")
            return
        }
        createMutation.mutate({
            items: data.items.map(itemSummary.from.itemResolution),
            address: {
                countryCode: country_code.get(),
                postcode: postcode.get(),
                state: state.get(),
                city: city.get(),
                street: street.get()
            },
            deliveryNote: deliveryNotes.get(),
            user: {
                email: email.get(),
                name: name.get()
            },
            isCreatingAccount: isCreatingAccount.get()
        })

        reset()
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            
            <h2>Checkout</h2>

            <UserComponent 
                nameField={name}
                emailField={email}
                isCreatingAccount={isCreatingAccount}
            />

            <CheckoutCartContent 
            items={data?.items} 
            totalCent={data?.totalCent}
            />

            <div>     
                <h2>Delivery Information</h2>

                <FormFieldsContainer>
                    <TextFormField field={country_code} />
                    <TextFormField field={postcode} />
                    <TextFormField field={state} />
                    <TextFormField field={city} />
                    <TextFormField field={street} />
                    <TextFormField field={deliveryNotes} />
                </FormFieldsContainer>
            </div>

			{errorMsg &&
                <p className="text-sm text-red-600">{errorMsg}</p>}

            <button type="submit">Pay with Stripe</button>
			
        </form>
    )
}

function UserComponent ({
    nameField, emailField, isCreatingAccount
} : {
    nameField: Field<string, TextField>,
    emailField: Field<string, TextField>,
    isCreatingAccount: Field<boolean, BooleanField>,
}) {
    const user = useAuthState(state => state.user)
    const isLoggedIn = useAuthState(state => state.isLoggedIn)

    if (isLoggedIn() && user) return (
        <div>
            <p>Account Information</p>
            <p>{user.name}</p>
            <p>{user.email}</p>
        </div>
    )
    return (
        <div className="checkout">

            <h2>Account Information</h2>

            <FormFieldsContainer>
                <TextFormField field={nameField} />
                <EmailFormField field={emailField} />
            </FormFieldsContainer>

            <input 
            type="checkbox" 
            className="rounded"
            id="iscreateuser"
            checked={isCreatingAccount.get()}
            onChange={(e) => isCreatingAccount.set(e.target.checked)}
            />
            <label htmlFor="iscreateuser"> 
                Would you like to create an account?
            </label>

        </div>
    )
}

function CheckoutCartContent({
    items, totalCent
} : {
    items: ItemResolution[] | undefined
    totalCent: number | undefined
}) {
    if (!items || !totalCent) return (
        <p>Loading...</p>
    )
    return (
        <div className="checkout">

            <h2>Cart</h2>

            <div>
                { items.map(o => 
                    <CardItemCard key={o.productSummary.name} itemResolution={o} />
                )}
            </div>

            <p>{formatMoney(totalCent)}</p>
        </div>
    )
}

function CardItemCard(
    { itemResolution }: 
    { itemResolution: ItemResolution }
) {
    const navigate = useNavigate()
    const productSummary = itemResolution.productSummary
    return (
        <div 
        className="rounded border border-slate-200 bg-white p-3 shadow-sm"
        >
            
            <div
            onClick={() => {navigate(`${PageRoutes.product}/${productSummary.slug}`)}}
            >
                <ProductMediaCarouselComponent productId={productSummary.id} limit={1} />
                <h2 className="mt-2 font-semibold">{productSummary.name}</h2>
            </div>
            
            <div className={itemResolution.onSale ? "bg-red-200" : ""} >
                <p>{formatMoney(itemResolution.unitPriceCent)} each </p>
                <p>{itemResolution.quantity}x </p>
                <p>{formatMoney(itemResolution.lineTotalCent)} total </p>
            </div>

        </div>
    )
}
