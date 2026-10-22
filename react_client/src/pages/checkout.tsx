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
    <Page className="checkout-page">
        <Heading className="checkout-title">
            Checkout
        </Heading>

        <CheckoutLoader
        render={({ 
            form: {handleSubmit, errorMsg, bindings}, setItems 
        }) => 
            <FormInputsContainer
            submit={handleSubmit}
            className="checkout-form"
            >
                <section className="checkout-section checkout-account-section">
                    <Heading level={2} className="checkout-section-title">
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
    
                <section className="checkout-section checkout-cart-section">
                    <Heading level={2} className="checkout-section-title">
                        Cart
                    </Heading>
                    <ResolutionLoader 
                    onSuccess={setItems}
                    render={({items ,totalCent}) =>
                    <>
                        <div className="checkout-cart-grid">
                            <List
                            items={items}
                            render={o => 
                                <ResolutionCard 
                                key={o.product.name} 
                                item={o}
                                />
                            }/>
                        </div>
                        <Text className="checkout-total">
                            Total <MoneyFormat
                            className="checkout-total-amount"
                            amount={totalCent}
                            />
                        </Text>
                    </>
                    } />
                </section>
        
                <section className="checkout-section checkout-delivery-section">
                    <Heading level={2} className="checkout-section-title">
                        Delivery Information
                    </Heading>
                    <div className="checkout-delivery-grid">
                        <TextField binding={bindings.country_code} />
                        <TextField binding={bindings.postcode} />
                        <TextField binding={bindings.state} />
                        <TextField binding={bindings.city} />
                        <TextField binding={bindings.street} />
                        <div className="checkout-notes-field">
                            <TextField
                            binding={bindings.deliveryNotes}
                            />
                        </div>
                    </div>
                </section>

                <ErrorMsg errorMsg={errorMsg} />

                <Button type="submit" className="checkout-submit">
                    Pay with Stripe
                </Button>
            </FormInputsContainer>
        }
        />
    </Page>
    )
}