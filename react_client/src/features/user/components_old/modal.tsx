import { formatMoney } from "@/utils/formatMoney";
import { Loading } from "@/shared";


import { useGetAnalyticsQuery, useUserDeleteMutation } from "../service";
import { ServerException } from "@/core/errors";
import { logger } from "@/core/logger";


export {
    DeleteUserModal,
    RowModal
}


function DeleteUserModal({onClose, onDelete}:{
    onClose: () => void,
    onDelete?: () => void
}) {
    const deleteUserMutation = useUserDeleteMutation();
    
    const handleDelete = async () => {
        deleteUserMutation.mutate(undefined, {
            onSuccess: async () => {
                onClose()
                onDelete?.()
            },
            onError: (error) => {
                if (error instanceof ServerException)
                    logger.error("Unexpected server error, unable to delete profile")
            }
        });
    }

    return(
        <>
            <h2>Are you sure you'd like to delete your Profile?</h2>
            <button onClick={handleDelete}>Yes</button>
            <button onClick={onClose}>No</button>
        </>
    )
}

function RowModal({ userId }: { 
    userId: number
 }) {
	const { data: user } = useGetAnalyticsQuery(userId);

	if (!user) return <Loading />;

	return (
		<div>
			<h2>User Details</h2>
			<div>
				<div>ID: {user.id}</div>
				<div>Name: {user.name}</div>
				<div>Email: {user.email}</div>
				<div>
					Registration: {user.isRegistered ? 'Registered' : 'Guest'}
				</div>
				<div>Created: {new Date(user.createdAt).toLocaleString()}</div>
				<div>
					Deleted: {user.deletedAt
						? new Date(user.deletedAt).toLocaleString()
						: 'No'}
				</div>
				<div>Orders: {user.orderCount}</div>
				<div>Spent: {formatMoney(user.spent)}</div>
				<div>Revenue lost: {formatMoney(user.revenueLost)}</div>
				<div>Reviews: {user.reviewCount}</div>
			</div>
		</div>
	);
}
