
import {
	BooleanFilterField,
	SelectMultipleFilterField,
	SelectOneFilterField,
	TextFilterField,
} from '@/shared/QueryParamsComponent';

import {
	useAdminSearchParams,
} from '../service';
import { Section } from '@/shared';


export {
    AdminUserQueryParams
}


function AdminUserQueryParams({params} : {
    params: ReturnType<typeof useAdminSearchParams>
}) {
    return (
        <Section>
            <TextFilterField accessor={params.search} />
            <SelectMultipleFilterField accessor={params.registration} />
            <SelectOneFilterField accessor={params.sortBy} />
            <BooleanFilterField accessor={params.isAscending} />
        </Section>
    )
}