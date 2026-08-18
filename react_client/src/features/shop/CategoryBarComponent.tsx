import { recordToList } from "@/utils/funcs"
import { useShopParams } from "./shopService"

function CategoryBarComponent() {
    const {categories, navigateToParams} = useShopParams()

    return (
        <div className="flex flex-wrap gap-2">
        { recordToList(categories.options).map(([_, cat]) => 
            <button key={cat}
            className="rounded border border-slate-300 px-2 py-1 text-sm"
            onClick={() => { 
                categories.set(() => [cat])
                navigateToParams()
            }}>
                {cat}
            </button>
        )}
        </div>
    )
}

export { CategoryBarComponent }