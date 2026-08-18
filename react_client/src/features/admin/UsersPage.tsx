import { ChevronDownIcon } from '@heroicons/react/24/outline';

import { PopUpModalComponent } from '@/shared/PopUpModalComponent';
import {
	BooleanFilterField,
	QueryParamsContainer,
	SelectMultipleFilterField,
	SelectOneFilterField,
	TextFilterField,
} from '@/shared/QueryParamsComponent';
import { formatMoney } from '@/utils/formatMoney';

import {
	useUserAnalyticsQuery,
	useUserParams,
	useUsersInfiniteQuery,
} from './AdminService';
import type {
	PostUserSearchRequest,
	UserAnalytics,
} from './AdminSchema';

function UsersPage() {
	const {
		getParams,
		isAscending,
		registration,
		search,
		sortBy,
	} = useUserParams();
	const { data, fetchNextPage, hasNextPage } = useUsersInfiniteQuery(
		20,
		getParams() as Omit<PostUserSearchRequest, 'limit' | 'offset'>,
	);
	const users = data?.pages.flatMap(page => page.users) ?? [];

	const title = search.get()
		? `Searching: ${search.get()}`
		: registration.get().join(', ') || 'All Users';

	const itemComponents = Object.fromEntries(
		users.map(user => [
			String(user.id),
			<UserCard key={user.id} user={user} />,
		]),
	);

	return (
		<div>
			<QueryParamsContainer>
				<TextFilterField accessor={search} />
				<SelectMultipleFilterField accessor={registration} />
				<SelectOneFilterField accessor={sortBy} />
				<BooleanFilterField accessor={isAscending} />
			</QueryParamsContainer>

			<h1 className="mb-2 text-lg font-semibold">{title}</h1>
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{Object.values(itemComponents)}
			</div>

			{hasNextPage ? (
				<ChevronDownIcon
					aria-label="ChevronDownIcon"
					className="h-24 w-24"
					onClick={() => fetchNextPage()}
				/>
			) : null}
		</div>
	);
}

function UserCard({ user }: { user: UserAnalytics }) {
	return (
		<PopUpModalComponent
			content={() => <UserModal userId={user.id} />}
		>
			<div className="rounded border p-3 text-left shadow-sm">
				<div className="font-semibold">{user.name}</div>
				<div>{user.email}</div>
				<div>{user.isRegistered ? 'Registered' : 'Guest'}</div>
				<div>Orders: {user.orderCount}</div>
				<div>Spent: {formatMoney(user.spent)}</div>
				<div>Reviews: {user.reviewCount}</div>
			</div>
		</PopUpModalComponent>
	);
}

function UserModal({ userId }: { userId: number }) {
	const { data, isLoading, isError } = useUserAnalyticsQuery(userId);

	if (isLoading) return <div>Loading...</div>;
	if (isError || !data) return <div>Error loading user details</div>;

	const { user } = data;

	return (
		<div>
			<h2 className="mb-3 text-lg font-semibold">User Details</h2>
			<div className="space-y-1 text-sm">
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

export { UsersPage };

