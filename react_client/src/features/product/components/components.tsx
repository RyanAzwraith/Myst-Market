import { 
    BooleanFilterField, 
    QueryParamsContainer, 
    SelectMultipleFilterField, 
    SelectOneFilterField, 
    TextFilterField
} from "@/shared/QueryParamsComponent";

import {    
    useAdminSearchParams,
    useSearchParams, 
} from "../service";


export {
    SearchParamsComponent,
    AdminSearchParamsComponent,
}

function SearchParamsComponent() {
    const {
        categories, rarities, sort, isAscending
    } = useSearchParams()

    return (
        <QueryParamsContainer> 
            <SelectMultipleFilterField accessor={categories}/>
            <SelectMultipleFilterField accessor={rarities}/>
            <SelectOneFilterField accessor={sort}/>
            <BooleanFilterField accessor={isAscending}/>
        </QueryParamsContainer>
    )
}

function AdminSearchParamsComponent() {
    const {
        categories, isAscending, isDiscontinued, rarities, search, sort,
    } = useAdminSearchParams();

    return (
      <QueryParamsContainer>
        <TextFilterField accessor={search} />
        <SelectMultipleFilterField accessor={categories} />
        <SelectMultipleFilterField accessor={rarities} />
        <SelectOneFilterField accessor={sort} />
        <BooleanFilterField accessor={isDiscontinued} />
        <BooleanFilterField accessor={isAscending} />
      </QueryParamsContainer>
    )
}