import { useNavigate } from "react-router-dom";

import { Page } from "@/shared";

import { PageRoutes } from "@/app/PageRoutes";

import { 
    UpdateForm,
    LogoutButton,
    PasswordResetButton,
    DeleteUserButton,
    UserOrdersSection,
    UserReviewsSection,
} from "@/features/user"
import { OrderCard } from "@/features/order"
import { 
    DeleteReviewButton, 
    ReviewCard 
} from "@/features/review";

export { ProfilePage }

function ProfilePage() {
    const navigate = useNavigate()
    return (
        <Page>
            <h1 className="text-lg font-semibold mb-4">Profile</h1>
            <LogoutButton
            onLogout={() => navigate(PageRoutes.login)}
            />

            <UpdateForm/>

            <PasswordResetButton/>
            <DeleteUserButton/>

            <UserOrdersSection 
            renderItems={(o) => 
                <OrderCard 
                key={o.id} 
                order={o} 
                onClick={() => navigate(`${PageRoutes.order}/${o.id}`)}
                />
            } />
            <UserReviewsSection 
            renderItems={(r) => <>
                <ReviewCard
                key={r.id}
                review={r}
                onClick={() => navigate(`${PageRoutes.product}/${r.productId}`)}
                />
                <DeleteReviewButton
                reviewId={r.id}
                />
            </>} />
        </Page>
    )
}
