import { Fragment, type ReactNode } from "react"
import { vi } from "vitest"

import type {
    Binding,
    FieldDef,
    FieldDefs,
    FieldValue,
} from "@/hooks/QueryParams/schema"
import { kind } from "@/hooks/QueryParams/schema"

vi.mock("@/shared", () => {
    function MockList<T>({
        items,
        renderItem,
    }: {
        items: T[]
        renderItem: (item: T, index: number) => ReactNode
    }) {
        return (
            <>
                {items.map((item, index) => (
                    <Fragment key={index}>
                        {renderItem(item, index)}
                    </Fragment>
                ))}
            </>
        )
    }

    function MockXMarkIcon({ onClick }: { onClick?: () => void }) {
        return (
            <button
                aria-label="clear"
                data-testid="clear-button"
                onClick={onClick}
                type="button"
            >
                clear
            </button>
        )
    }

    return {
        List: MockList,
        XMarkIcon: MockXMarkIcon,
    }
})

const fields = {
    enabled: {
        kind: kind.boolean,
        label: "Enabled",
    },
    sort: {
        kind: kind.selectOne,
        label: "Sort",
        defaultValue: "name",
        options: {
            name: "name",
            price: "price",
        },
        labels: {
            name: "Name",
            price: "Price",
        },
    },
    categories: {
        kind: kind.selectMultiple,
        label: "Categories",
        options: {
            magic: "magic",
            weapon: "weapon",
        },
        labels: {
            magic: "Magic",
            weapon: "Weapon",
        },
    },
    search: {
        kind: kind.text,
        label: "Search",
    },
} satisfies FieldDefs

function makeBinding<F extends FieldDef>(
    fieldKey: string,
    field: F,
    value: FieldValue<F>,
): Binding<F> {
    const get = vi.fn(() => value)
    const set = vi.fn<Binding<F>["set"]>()

    return {
        ...field,
        fieldKey,
        get,
        set,
    } as Binding<F>
}

export {
    fields as queryFields,
    makeBinding,
}
