import { QueryParamsContainer,
	BooleanFilterField,
	SelectMultipleFilterField,
	SelectOneFilterField,
	TextFilterField,
} from '@/shared/QueryParamsComponent';
import type { useAdminSearchParams } from '../service';


export {
    AdminQueryParmsComponent,
}


function AdminQueryParmsComponent({params}: {
    params: ReturnType<typeof useAdminSearchParams>
}) {
    const { activation, isAscending, search, sortBy } = params
    return (
        <QueryParamsContainer>
            <TextFilterField accessor={search} />
            <SelectMultipleFilterField accessor={activation} />
            <SelectOneFilterField accessor={sortBy} />
            <BooleanFilterField accessor={isAscending} />
        </QueryParamsContainer>
    )
}