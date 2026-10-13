import { 
    ErrorMsg, 
    Page,
    List,
    MoneyFormat,
    Heading,
    Text,
    Button,
} from "@/shared"

import { 
    TextField, 
    EmailField, 
    BooleanField,
    FormInputsContainer,
} from "@/hooks/FormInputs"

import { 
    LoggedInLoader, 
    UserInfo, 
    CheckoutLoader,
} from "@/features/order"

import {
    ResolutionLoader,
    ResolutionCard
} from "@/features/item"

export { CheckoutPage }


function CheckoutPage() {
    return (
    <Page className="py-8 mx-auto max-w-4xl space-y-8">  
        <Heading className="text-center text-3xl sm:text-4xl">
            Checkout
        </Heading>

        <CheckoutLoader
        render={({ 
            form: {handleSubmit, errorMsg, bindings}, setItems 
        }) => 
            <FormInputsContainer submit={handleSubmit} className="space-y-8">
                <section className={
                    "space-y-8 rounded-xl border " +
                    "border-gray-200 bg-white p-5 shadow-sm"
                }>
                    <Heading level={2} className="text-xl">
                        Account Information
                    </Heading>
                        <LoggedInLoader 
                        render={(user) => user ? 
                            <UserInfo user={user} /> 
                                : 
                            <>
                                <TextField binding={bindings.name} />
                                <EmailField binding={bindings.email} />
                                <BooleanField
                                binding={bindings.isCreatingAccount}
                                />
                            </>
                        } />
                </section>
    
                <section className={
                    "space-y-4 rounded-xl border " +
                    "border-gray-200 bg-white p-5 shadow-sm"
                }>
                    <Heading level={2} className="text-xl">
                        Cart
                    </Heading>
                    <ResolutionLoader 
                    onSuccess={setItems}
                    render={({items ,totalCent}) =>
                    <>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <List
                            items={items}
                            render={o => 
                                <ResolutionCard 
                                key={o.product.name} 
                                item={o}
                                />
                            }/>
                        </div>
                        <Text className="font-semibold">
                            Total <MoneyFormat className="text-lg font-bold" amount={totalCent} />
                        </Text>
                    </>
                    } />
                </section>
        
                <section className={
                    "space-y-4 rounded-xl border " +
                    "border-gray-200 bg-white p-5 shadow-sm"
                }>
                    <Heading level={2} className="text-xl">
                        Delivery Information
                    </Heading>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <TextField binding={bindings.country_code} />
                        <TextField binding={bindings.postcode} />
                        <TextField binding={bindings.state} />
                        <TextField binding={bindings.city} />
                        <TextField binding={bindings.street} />
                        <div className="sm:col-span-2">
                            <TextField
                            binding={bindings.deliveryNotes}
                            />
                        </div>
                    </div>
                </section>

                <ErrorMsg errorMsg={errorMsg} />

                <Button type="submit" className="w-full py-3 text-base">
                    Pay with Stripe
                </Button>
            </FormInputsContainer>
        }
        />
    </Page>
    )
}