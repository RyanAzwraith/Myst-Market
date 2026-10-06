import { 
    ErrorMsg, 
    Page,
    List,
    MoneyFormat,
    Heading,
    Text,
    Button,
    Section,
    Stack,
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
    <Page>  
        <Heading>Checkout</Heading>

        <CheckoutLoader
        render={({ 
            form: {handleSubmit, errorMsg, bindings}, setItems 
        }) => 
            <FormInputsContainer submit={handleSubmit}>
                
                <Heading level={2}>Account Information</Heading>
                <Section
                children={
                    <LoggedInLoader 
                    render={(user) => user ? 
                        <UserInfo user={user} /> 
                            : 
                    <>
                        <TextField binding={bindings.name} />
                        <EmailField binding={bindings.email} />
                        <BooleanField binding={bindings.isCreatingAccount} />
                    </>
                    } />
                } />

                <Heading level={2}>Cart</Heading>
                <Section
                children={
                    <ResolutionLoader 
                    onSuccess={setItems}
                    render={({items ,totalCent}) =>
                    <>
                        <Stack
                        children={
                            <List
                            items={items}
                            render={o => 
                                <ResolutionCard 
                                key={o.product.name} 
                                item={o}
                                />
                            }/>
                        } />
                        <Text>Total: <MoneyFormat amount={totalCent} /> </Text>
                    </>
                    } />
                } />
                    
                <Heading level={2}>Delivery Information</Heading>
                <Section
                children={
                    <>
                    <TextField binding={bindings.country_code} />
                    <TextField binding={bindings.postcode} />
                    <TextField binding={bindings.state} />
                    <TextField binding={bindings.city} />
                    <TextField binding={bindings.street} />
                    <TextField binding={bindings.deliveryNotes} />
                    </>
                } />

                <ErrorMsg errorMsg={errorMsg} />

                <Button type="submit">Pay with Stripe</Button>
            </FormInputsContainer>
        }
        />

    </Page>
    )
}