import { Card, Heading, Page, Text } from "@/shared"
export { SuccessPage }

function SuccessPage() {
    return (
    <Page className="success-page">
        <Card className="success-card">
            <Heading className="success-title">
                Success!
            </Heading>
            <Text className="success-message">
                Your payment was a success.
            </Text>
            <Text className="success-detail">
                Check your email for confirmation.
            </Text>
        </Card>
    </Page>
    )
}