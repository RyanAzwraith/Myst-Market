

import { 
    useAdminSearchParams, 
    useAdminSearchQuery 
} from "../service";
import type { AdminSearchParams } from "../schema";
import { ChevronDownIcon } from "@/shared";
import { AdminUserQueryParams } from "./component";
import { UserRow } from "./card";
import { Display } from "@/shared/elements/display";
import { List } from "@/shared";


export {
    AdminSearchDisplay
}


function AdminSearchDisplay({limit} : {
    limit: number
}) {
    const params = useAdminSearchParams();
	const {
		getParams,
		registration,
		search,
	} = params;

	const { data, fetchNextPage, hasNextPage } = useAdminSearchQuery(
		limit, getParams() as AdminSearchParams,
	)
    if (!data) return <div>Loading...</div>;
	const users = data?.pages.flatMap(page => page.users) ?? [];

	const title = search.get()
		? `Searching: ${search.get()}`
		: registration.get().join(', ') || 'All Users';


	return (
		<Display>
			<AdminUserQueryParams params={params} />
			<h1>{title}</h1>

            <List
            items={users}
            renderItem={(user) => (
                <UserRow 
                key={user.id}
                user={user} 
                />
            )} />  

            <ChevronDownIcon
            onClick={() => fetchNextPage()}
            hidden={hasNextPage ?? false}
            />
		</Display>
	);
}