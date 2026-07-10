
import { 
    useCategoriesQuery,
    useRaritiesQuery
} from "./shopService"
import { useShopParams } from "./shopService"
import type { SortByType} from './shopSchemas'
import { SortBy } from './shopSchemas'

function SearchParamComponents() {

    return (
        <div className="mb-4">
            <CategoryCheckBoxesDiv />
            <RarityCheckBoxesDiv />
            <SortByDropDown />
            <AscendingCheckBox />
        </div>
    )
}

function CategoryCheckBoxesDiv () {
    const shopParams = useShopParams()
    const {data: categories} = useCategoriesQuery()

    function makeHandleChange (category : string) {
        return (e: React.ChangeEvent<HTMLInputElement>) => {
            if (!e.target.checked) {
                shopParams.categories.set((prev: string[]) => 
                    prev.filter(r => r !== category)
                ) 
                shopParams.navigateShop()
                return true
            }
            else { 
                shopParams.categories.set((prev: string[]) => 
                    [...prev, category]
                )
                shopParams.navigateShop()
                return false
            }
        }
    }
    return (
        <div className="flex flex-wrap gap-3">
            <span>Category: </span>
            {categories?.map(category => 
                <div key={category}>
                    <input 
                    type="checkbox" 
                    className="rounded"
                    checked={shopParams.categories.value.includes(category)}
                    onChange={(e) => makeHandleChange(category)(e)} />
                    <label htmlFor={category}> {category}</label>
                </div>
            )}
            <button
            onClick={() => {
                shopParams.categories.set(() => [])
                shopParams.navigateShop()
            }}>
                clear
            </button>
        </div>
    )
}

function RarityCheckBoxesDiv () {
    const shopParams = useShopParams()

    const {data: rarities} = useRaritiesQuery()

    function makeHandleChange (rarity : string) {
        return (e: React.ChangeEvent<HTMLInputElement>) => {
            if (!e.target.checked) {
                shopParams.rarities.set((prev: string[]) => 
                    prev.filter(r => r !== rarity)
                ) 
                shopParams.navigateShop()
                return true
            }
            else { 
                shopParams.rarities.set((prev: string[]) => 
                    [...prev, rarity]
                )
                shopParams.navigateShop()
                return false
            }
        }
    }

    return (
        <div className="flex flex-wrap gap-3">
            <span>Rarity: </span>
            {rarities?.map(rarity => 
                <div key={rarity}>
                    <input 
                    type="checkbox" 
                    className="rounded"
                    checked={shopParams.rarities.value.includes(rarity)}
                    onChange={(e) => makeHandleChange(rarity)(e)} />
                    <label htmlFor={rarity}>{rarity}</label>
                </div>
            )}
            
            <button
            onClick={() => {
                shopParams.rarities.set(() => [])
                shopParams.navigateShop()
            }}>
                clear
            </button>
        </div>
    )
}

function AscendingCheckBox () {
    const shopParams = useShopParams()
    return (
        <div>
            <label htmlFor="isAscending"> Ascending</label>
            <input 
            type="checkbox" 
            className="rounded" 
            checked={shopParams.isAscending.value}
            onChange={(e) => {
                shopParams.isAscending.set(() => e.target.checked)
                shopParams.navigateShop()
            }}
            />
        </div>
    )
}

function SortByDropDown () {
    const shopParams = useShopParams()
    return (
        <select 
        name='sortBy'
        value={shopParams.sortBy.value}
        onChange={(e) => {
            shopParams.sortBy.set(() => e.target.value as SortByType)
            shopParams.navigateShop()
        }}>
        {Object.values(SortBy).map(option => 
            <option key={option} value={option}>{option}</option>
        )}
        </select>
    )
            
}

export {SearchParamComponents}