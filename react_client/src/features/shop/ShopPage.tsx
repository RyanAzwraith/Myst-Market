import { useQuery } from "@tanstack/react-query"

import { useShopState } from "./shopState"
import { get_all_categories_route } from "./shopApi"

function Shop() {
    const { catagories, isLoading, error } = useQuery({
        queryKey: ["categories"],
        queryFn: async () => await get_all_categories_route()
    });

    return (
        <div className="shop">

            <SearchBar />
            { catagories.map((cat) => ( {
                <CategoryDiv cat={cat} />
            }}


        </div>
    )
}

function SearchBar() {
    return (<></>)
}

function CategoryDiv() {
    return (<></>)
}



export { Shop }
