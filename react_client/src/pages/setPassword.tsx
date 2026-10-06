import { useNavigate } from "react-router-dom";

import { Page, Heading } from "@/shared"

import { PageRoutes } from "@/app/PageRoutes"

import { SetPasswordForm } from "@/features/user"


export { SetPasswordPage }

function SetPasswordPage() {
    const navigate = useNavigate(); 
    return (
    <Page>
        <Heading>Set Password</Heading>
        <SetPasswordForm 
        onSuccess={() => navigate(PageRoutes.profile)}
        />
    </Page>
    )
}