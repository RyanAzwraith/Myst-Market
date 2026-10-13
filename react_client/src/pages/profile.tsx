import { useNavigate } from "react-router-dom";

import { List, Page, Heading, Stack, ExpandableContent } from "@/shared";

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
    <Page className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        <Heading className="text-center text-3xl sm:text-4xl">
            Profile
        </Heading>
        <LogoutButton
        onSuccess={() => navigate(PageRoutes.login)}
        />

        <UpdateForm
        className="space-y-4 rounded-xl border border-gray-200 bg-white p-6
            shadow-sm"
        />

        <PasswordResetButton/>
        <DeleteUserButton/>

        <Heading level={2} className="pt-4 text-2xl">Orders</Heading>
        <OrdersLoader 
        render={({orders}) => 
            <Stack
            className="gap-3"
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

        <Heading level={2} className="pt-4 text-2xl">Reviews</Heading>
        <ReviewsLoader 
        render={({reviews}) => 
            <Stack
            className="gap-3"
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
    </Page>
    )
}
