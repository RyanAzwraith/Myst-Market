import { Page, Heading, Text } from "@/shared"
export { SuccessPage }

function SuccessPage() {
    return (
    <Page>
        <Heading>Success!</Heading>
        <Text>Your payment was a success.</Text>
        <Text>Check your email for confirmation.</Text>
    </Page>
    )
}