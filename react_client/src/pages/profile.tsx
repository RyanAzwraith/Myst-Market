import { useNavigate } from "react-router-dom";

import { List, Page, Heading, Stack } from "@/shared";

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
    <Page>
        <Heading>Profile</Heading>
        <LogoutButton
        onSuccess={() => navigate(PageRoutes.login)}
        />

        <UpdateForm/>

        <PasswordResetButton/>
        <DeleteUserButton/>

        <Heading level={2}>Orders</Heading>
        <OrdersLoader 
        render={({orders}) => 
            <Stack
            children={
                <List
                items={orders}
                render={(o) => (
                    <OrderCard 
                    key={o.id} 
                    order={o} 
                    onClick={() => navigate(`${PageRoutes.order}/${o.id}`)}
                    />
                )} />
            } />
        } />

        <Heading level={2}>Reviews</Heading>
        <ReviewsLoader 
        render={({reviews}) => 
            <Stack
            children={
                <List
                items={reviews}
                render={(r) => (
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
                )} />
            } />
        } />
    </Page>
    )
}
