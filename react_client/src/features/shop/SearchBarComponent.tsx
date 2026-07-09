import { useState } from 'react'
import { XMarkIcon } from "@heroicons/react/24/solid";

import { useShopParams } from "./shopService"

function SearchBarComponent() {
    const shopParams = useShopParams()

    const [search, setSearch] = useState('')

    function handleSearch() {
        shopParams.search.set(() => search)
        shopParams.navigateShop()
    }

    return (
        <div 
        className='flex'>
            <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={({key}) => key==="Enter" ? handleSearch() : null}
            onBlur={handleSearch}
            className="w-full rounded border border-slate-300 p-2"
            /> 
            <XMarkIcon 
            className="h-6 w-6" 
            onClick={() => { 
                setSearch('')
                shopParams.search.set(() => '')
                shopParams.navigateShop()
            }} />
        </div>
    )
}

export { SearchBarComponent }