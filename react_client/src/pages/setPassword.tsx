import { useNavigate } from "react-router-dom";

import { Page } from "@/shared/elements/page"

import { PageRoutes } from "@/app/PageRoutes"

import { SetPasswordForm } from "@/features/user"


export { SetPasswordPage }

function SetPasswordPage() {
    const navigate = useNavigate(); 
    return (
        <Page>
			<h1 className="text-lg font-semibold mb-4">Set Password</h1>
            <SetPasswordForm 
            onSubmit={() => navigate(PageRoutes.profile)}
            />
        </Page>
    )
}