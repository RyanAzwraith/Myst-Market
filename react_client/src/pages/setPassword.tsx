import { useNavigate, useSearchParams } from "react-router-dom";

import { Page, Heading, Text } from "@/shared"

import { PageRoutes } from "@/app/PageRoutes"

import { SetPasswordForm } from "@/features/user"


export { SetPasswordPage }

function SetPasswordPage() {
    const navigate = useNavigate(); 
    const [searchParams] = useSearchParams()
    const isDemoRegistration = searchParams.get("demo") === "true"
    return (
    <Page className="set-password-page auth-page">
        <Heading className="auth-page-title">
            Set Password
        </Heading>
        {isDemoRegistration && (
            <Text className="demo-email-message" role="status">
                Email services are unavailable in this demo. Set your password directly below.
            </Text>
        )}
        <SetPasswordForm 
        className="set-password-form-card"
        onSuccess={() => navigate(PageRoutes.profile)}
        />
    </Page>
    )
}