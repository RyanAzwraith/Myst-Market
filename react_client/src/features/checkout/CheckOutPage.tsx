import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { AppRoutes } from "@/AppRoutes"
import { InputLabelComponent } from "@/shared/InputLableComponent"
import { useFormFields, validateEmail } from "@/utils/useFormFields"
import { formatMoney } from "@/utils/formatMoney"

import type {
    UserSummary,
    AddressDetail,
    ItemResolution,
    CheckoutUserRequest,        
    CheckoutGuestRequest,
} from "./checkoutSchemas"
import {
    ItemSummary,
} from "./checkoutSchemas"
import {
    useResolveItemsQuery,
    useCheckouGuesttMutation,
    useCheckoutUserMutation,
} from "./checkoutService"

import { useAuthState } from "@/features/user/authState"
import { registerRoute } from "@/features/user/authApi"
import type { UserModel } from "@/features/user/authState"
import { useState } from "react";
import { ProductMediaCarouselComponent } from "../media/mediaComponent";

function CheckOutPage() {
    const authState = useAuthState(state => state )
    const {data: resolveItemsRespones} = useResolveItemsQuery()

    const checkoutUserMutation = useCheckoutUserMutation()
    const checkoutGuestMutation = useCheckouGuesttMutation()

    const { 
        values, setters, errorMsg, setErrorMsg, validate, reset 
    } = useFormFields([
        {
            name: "name",
            validateFunc: (v) => !v ? "Name Required" : null ,
        }, {
            name: "email",
            validateFunc: validateEmail,
        }, {
            name: "country_code",
            validateFunc: (v) => !v ? "Country Code Required" : null ,
        }, {
            name: "postcode",
            validateFunc: (v) => !v ? "Postcode Required" : null ,
        }, {
            name: "state",
            validateFunc: (v) => !v ? "State Required" : null ,
        }, {
            name: "city",
            validateFunc: (v) => !v ? "City Required" : null ,
        },  {
            name: "street",
            validateFunc: (v) => !v ? "Street Required" : null ,
        }, {
            name: "deliveryNotes",
            initial: ""
        }, 
    ])
    const [isCreateAccount, setIsCreatingAccount] = useState(false)

	async function handleSubmit (event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault()
        if (!validate()) return
        if (!resolveItemsRespones) {
            setErrorMsg("Missing Cart Items")
            return
        }
        const checkoutUserRequest = {
            itemSummaries: resolveItemsRespones.itemResolutions.map(
                ItemSummary.from.ItemResolution
            ),
            addressDetail: {
                countryCode: values.country_code,
                postcode: values.postcode,
                state: values.state,
                city: values.city,
                street: values.street
            } as AddressDetail,
            deliveryNote: values.deliveryNotes
        } as CheckoutUserRequest

        if (authState.accessToken) {
            checkoutUserMutation.mutate(checkoutUserRequest)
        } else {
            const userSummary = {
                email: values.email,
                name: values.name
            } as UserSummary

            checkoutGuestMutation.mutate(
                {...checkoutUserRequest, userSummary } as CheckoutGuestRequest
            )
            if (isCreateAccount)
                registerRoute(userSummary)
        }

        reset()
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            
            <h2>Checkout</h2>

            { authState.userModel && authState.accessToken  
            ?   <LoggedInUserComponent 
                userModel={authState.userModel} 
                setters={setters} 
                /> 

            :   <LoggedOutUserComponent
                isCreatingAccount={isCreateAccount}
                setIsCreatingAccount={setIsCreatingAccount}
                setters={setters} 
                values={values} 
                />
            }
            {resolveItemsRespones &&
                <CheckoutCartContent 
                itemResolutions={resolveItemsRespones.itemResolutions} 
                totalCent={resolveItemsRespones.totalCent}
                />
            }
            

            <DeliveryInfo 
            setters={setters} 
            values={values}  
            />

			{errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}

            <button type="submit">Pay with Stripe</button>
			
        </form>
    )
}

function LoggedInUserComponent ({
    userModel, setters
} : {
    userModel: UserModel,
    setters: Record<string, (v: string) => void>,
}) {
    useEffect(() => {
        setters.name(userModel.name)
        setters.email(userModel.email)
    }, [userModel.name, userModel.email, setters])

    return (
        <div>
            <p>Account Information</p>
            <p>{userModel.name}</p>
            <p>{userModel.email}</p>
        </div>
    )
}

function LoggedOutUserComponent({
    isCreatingAccount, setIsCreatingAccount, values, setters,
} : {
    isCreatingAccount: boolean, 
    setIsCreatingAccount: any,
    values: any,
    setters: Record<string, (v: string) => void>,
}) {

    return (
        <div className="checkout">

            <h2>Account Information</h2>

            <InputLabelComponent name="name">
                <input 
                id="name"
                value={values.name}
                onChange={(e) => setters.name(e.target.value)}
                />
            </InputLabelComponent>

            <InputLabelComponent name="email">
                <input 
                id="email"
                value={values.email}
                onChange={(e) => setters.email(e.target.value)}
                />
            </InputLabelComponent>

            <input 
            type="checkbox" 
            className="rounded"
            id="iscreateuser"
            checked={isCreatingAccount}
            onChange={(e) => setIsCreatingAccount(e.target.checked)}  
            />
            <label htmlFor="iscreateuser"> 
                Would you like to create an account?
            </label>

        </div>
    )   
        
}

function CheckoutCartContent({
    itemResolutions, totalCent
} : {
    itemResolutions: ItemResolution[]
    totalCent: number
}) {
    return (
        <div className="checkout">

            <h2>Cart</h2>

            <div>
                { itemResolutions.map(o => 
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
            onClick={() => {navigate(`${AppRoutes.product}/${productSummary.slug}`)}}
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

function DeliveryInfo({
    values, setters,
} : {
    values: any,
    setters: Record<string, (v: string) => void>,
}) {

    return (
        <div className="checkout">

            <h2>Delivery Information</h2>

            <InputLabelComponent name="country_code">
                <input 
                id="country_code"
                placeholder="country code"
                value={values.country_code}
                onChange={(e) => setters.country_code(e.target.value)}
                />
            </InputLabelComponent>

            <InputLabelComponent name="postcode">
                <input 
                id="postcode"
                placeholder="postcode"
                value={values.postcode}
                onChange={(e) => setters.postcode(e.target.value)}
                />
            </InputLabelComponent>

            <InputLabelComponent name="state">
                <input 
                id="state"
                placeholder="state"
                value={values.state}
                onChange={(e) => setters.state(e.target.value)}
                />
            </InputLabelComponent>

            <InputLabelComponent name="city">
                <input 
                id="city"
                placeholder="city"
                value={values.city}
                onChange={(e) => setters.city(e.target.value)}
                />
            </InputLabelComponent>

            <InputLabelComponent name="street">
                <input 
                id="street"
                placeholder="street"
                value={values.street}
                onChange={(e) => setters.street(e.target.value)}
                />
            </InputLabelComponent>

            <InputLabelComponent name="deliveryNotes">
                <input 
                id="deliveryNotes"
                placeholder="delivery note"
                value={values.deliveryNotes}
                onChange={(e) => setters.deliveryNotes(e.target.value)}
                />
            </InputLabelComponent>

        </div>
    )   
}

export {
    CheckOutPage,
    LoggedInUserComponent,
    LoggedOutUserComponent,
    CheckoutCartContent,
    DeliveryInfo
}