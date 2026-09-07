
import { useState } from "react"

import {
    TextFormField,
} from "@/shared/FormFieldsComponent"
import { ErrorMsg } from "@/shared/elements/text"

import {
    UserFormSection,
    CartFormSection,
    type ItemSummary,
} from '../index'

import {
    useCheckoutFormFields,
    useCreateMutation,
} from "../service"


export { 
    CheckoutForm, 
    AccountFormSection 
}


function CheckoutForm({onItemCardClick}: {
    onItemCardClick?: (item: ItemSummary) => void
}) {
    const createMutation = useCreateMutation()
    const form = useCheckoutFormFields()
    const {
        email, name, isCreatingAccount, country_code, postcode, state, city, street, deliveryNotes,
        reset, validate, setErrorMsg, errorMsg
    } = form
    const [items, setItems] = useState<ItemSummary[] | null>(null)

    function handleSubmit (event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault()
        if (!validate()) return
        if (!items) {
            setErrorMsg("Missing Cart Items")
            return
        }
        createMutation.mutate({
            items: items,
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
        <form onSubmit={handleSubmit}>
            <h2>Checkout</h2>

            <UserFormSection form={form} />
            <CartFormSection 
            setItems={setItems} 
            onItemCardClick={onItemCardClick}
            />
            <AccountFormSection form={form} />

            <ErrorMsg errorMsg={errorMsg} />

            <button type="submit">Pay with Stripe</button>
        </form>
    )
}


function AccountFormSection({form}: {
    form: ReturnType<typeof useCheckoutFormFields>
}) {
    const {
        country_code, postcode, state, city, street, deliveryNotes
    } = form
    return (
        <section>
            <h2>Delivery Information</h2>
            <TextFormField field={country_code} />
            <TextFormField field={postcode} />
            <TextFormField field={state} />
            <TextFormField field={city} />
            <TextFormField field={street} />
            <TextFormField field={deliveryNotes} />
        </section>

    )
}