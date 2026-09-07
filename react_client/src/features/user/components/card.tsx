import { formatMoney } from "@/utils/formatMoney";

import { Row } from "@/shared";
import { PopUpModalComponent } from "@/shared/PopUpModalComponent";

import type { UserAnalytics } from "../schema";

import { RowModal } from "./modal";


export {
    UserRow
}


function UserRow({ user }: { 
    user: UserAnalytics 
}) {
	return (
		<PopUpModalComponent
		content={() => <RowModal userId={user.id} />}
		>
			<Row >
				<div >{user.name}</div>
				<div>{user.email}</div>
				<div>{user.isRegistered ? 'Registered' : 'Guest'}</div>
				<div>Orders: {user.orderCount}</div>
				<div>Spent: {formatMoney(user.spent)}</div>
				<div>Reviews: {user.reviewCount}</div>
			</Row>
		</PopUpModalComponent>
	);
}