import { useSearchParams } from "../service"
import { List } from "@/shared"

export { CategoryBar }

function CategoryBar() {
    const {categories, navigateToParams} = useSearchParams()

    return (
        <List
        items={categories}
        renderItem={(c) =>
            <button 
            className="rounded border border-slate-300 px-2 py-1 text-sm"
            onClick={() => { 
                categories.set(() => [c])
                navigateToParams()
            }}>
                {c as string}
            </button>
        } />
    )
}
