import { Card, Heading, Page, Text } from "@/shared"
export { SuccessPage }

function SuccessPage() {
    return (
    <Page className="flex min-h-[70vh] items-center justify-center py-8">
        <Card className={
            "w-full max-w-lg space-y-4 border-green-200 " +
            "bg-green-50 p-8 text-center shadow-md"
        }>
            <Heading className="text-3xl text-green-800 sm:text-4xl">
                Success!
            </Heading>
            <Text className="text-lg font-medium text-green-900">
                Your payment was a success.
            </Text>
            <Text className="text-green-700">
                Check your email for confirmation.
            </Text>
        </Card>
    </Page>
    )
}