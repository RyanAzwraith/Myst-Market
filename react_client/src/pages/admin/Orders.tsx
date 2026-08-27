

import { 
    OrdersQueryParamsSection,
    OrdersDisplay,
} from "@/old_features/admin";

export { OrdersPage }

function OrdersPage() {

    return (
        <div> 
            <OrdersQueryParamsSection />
            <OrdersDisplay />
        </div>
    )
}
