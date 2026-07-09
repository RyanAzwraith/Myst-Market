
import { useShopParams, useCategoriesQuery } from "./shopService"

function CategoryBarComponent() {
    const shopParams = useShopParams()

    const {data: categories} = useCategoriesQuery()

    return (
        <div className="flex flex-wrap gap-2">
        { categories?.map((cat) => 
            <button key={cat}
            className="rounded border border-slate-300 px-2 py-1 text-sm"
            onClick={() => { 
                shopParams.categories.set(() => [cat])
                shopParams.navigateShop()
            }}>
                {cat}
            </button>
        )}
        </div>
    )
}

export { CategoryBarComponent }