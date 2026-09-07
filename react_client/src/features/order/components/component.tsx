
import {
    SelectOneFilterField,
    SelectMultipleFilterField,
    TextFilterField,
    QueryParamsContainer
} from '@/shared/QueryParamsComponent';

import { useAdminSearchParams } from '../service';


export {
    AdminQueryParms
}


function AdminQueryParms() {
    
    const {
        sort, status, searchName
    } = useAdminSearchParams()

    return (      
        <QueryParamsContainer> 
            <TextFilterField accessor={searchName}/>
            <SelectMultipleFilterField accessor={status}/>
            <SelectOneFilterField accessor={sort}/>
        </QueryParamsContainer>
    )
}