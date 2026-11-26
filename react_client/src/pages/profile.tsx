import { useNavigate } from "react-router-dom";

import {
    List,
    Page,
    Heading,
    Stack,
    ExpandableContent,
    Divider,
} from "@/shared";

import { PageRoutes } from "@/app/PageRoutes";

import { 
    UpdateForm,
    LogoutButton,
    PasswordResetButton,
    DeleteUserButton,
    ReviewsLoader, 
    OrdersLoader
} from "@/features/user"
import { OrderCard } from "@/features/order"
import { 
    DeleteButton as DeleteReviewButton, 
    ReviewCard 
} from "@/features/review";

export { ProfilePage }

function ProfilePage() {
    const navigate = useNavigate()
    return (
    <Page className="profile-page">
        <div className="profile-header">
            <Heading className="profile-title">
                Profile
            </Heading>
            <LogoutButton
            onSuccess={() => navigate(PageRoutes.login)}
            />
        </div>

        <section className="profile-account-section">
            <Heading level={2} className="profile-section-title">
                Account Information
            </Heading>
            <UpdateForm className="profile-form" />
            <Divider className="profile-actions-divider" />
            <div className="profile-action-group">
                <PasswordResetButton/>
                <DeleteUserButton/>
            </div>
        </section>

        <section className="profile-record-section">
            <Heading level={2} className="profile-section-title">
                Orders
            </Heading>
            <OrdersLoader 
            render={({orders}) => 
                <Stack
                className="profile-list"
                children={
                    <ExpandableContent
                    content={orders.map((o) => (
                        <OrderCard 
                        key={o.id} 
                        order={o} 
                        onClick={() => navigate(`${PageRoutes.order}/${o.id}`)}
                        />
                    ))}
                    limit={3}
                    />
                } />
            } />
        </section>

        <section className="profile-record-section">
            <Heading level={2} className="profile-section-title">
                Reviews
            </Heading>
            <ReviewsLoader 
            render={({reviews}) => 
                <Stack
                className="profile-list"
                children={
                    <ExpandableContent
                    content={reviews.map((r) => (
                        <ReviewCard
                        key={r.id}
                        review={r}
                        onClick={() => navigate(PageRoutes.product(r.productSlug))}
                        children={
                            <DeleteReviewButton
                            reviewId={r.id}
                            />
                        }
                        />
                    ))} 
                    limit={3}
                    />
                } />
            } />
        </section>
    </Page>
    )
}
