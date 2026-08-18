import type { ReactNode } from 'react'


import { mapToList, recordToList } from '@/utils/funcs'

import type {
    BooleanField,
    TextField,
    NumberField,
    SelectOneField,
    SelectMultipleField,
    Field,
} from '@/utils/useSelectEdit'


function SelectEditComponent({
    fieldComponents,
    itemComponents,
    useSelectEdit: {
        selectedIds,
        isSelected,
        toggleSelect,
        isAllSelected,
        toggleSelectAll,
        submit,
    },
}: {
    fieldComponents: ReactNode,
    itemComponents: Record<string, ReactNode>,
    useSelectEdit: {
        selectedIds: ReadonlySet<string>,
        isSelected: (id: string) => boolean,
        toggleSelect: (id: string) => void,
        isAllSelected: boolean,
        toggleSelectAll: () => void,
        submit: () => void,
    }
}) {
    return (
        <div>
            <label>
                <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                />
                Select all
            </label>
            <div className="mb-4 flex items-center gap-2">
                {fieldComponents}
                <button
                    type="button"
                    onClick={submit}
                    disabled={selectedIds.size === 0}
                >
                    Update selected
                </button>
            </div>

            {mapToList(itemComponents, (itemComponent, id) => 
                <ItemContainer
                    key={id}
                    isSelected={isSelected(id)}
                    toggleSelected={() => toggleSelect(id)}
                    itemComponent={itemComponent}
                />
            )}
        </div>
    )
}

function ItemContainer({
    itemComponent, isSelected, toggleSelected,
}: {
    itemComponent: ReactNode,
    isSelected: boolean,
    toggleSelected: () => void,
}) {    
    return (
        <div>
            <label>
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={toggleSelected}
                />
                Select   
            </label>
            {itemComponent}
        </div>
    )
}

function BooleanEditField({
    field,
}: {
    field: Field<boolean, BooleanField>
}) {
    const value = field.get()

    const handleChange = (nextRawValue: string) => {
        if (nextRawValue === '') {
            field.set(null)
            return
        }

        field.set(nextRawValue === 'true')
    }

    return (
        <div>
            <label>
                {field.label}
                <select
                    value={value === null ? '' : String(value)}
                    onChange={event => handleChange(event.target.value)}
                >
                    <option value="">No change</option>
                    <option value="true">True</option>
                    <option value="false">False</option>
                </select>
            </label>
        </div>
    )
}

function TextEditField({
    field,
}: {
    field: Field<string, TextField>
}) {
    return (
        <label>
            {field.label}
            <input
                type="text"
                placeholder={field.placeholder}
                value={field.get() ?? ''}
                onChange={event =>
                    field.set(event.target.value || null)
                }
            />
        </label>
    )
}

function NumberEditField({
    field,
}: {
    field: Field<number, NumberField>
}) {
    const value = field.get()

    return (
        <label>
            {field.label}
            <input
                type="number"
                step={field.step}
                value={value === null ? '' : value}
                onChange={event => {
                    const rawValue = event.target.value
                    field.set(rawValue === '' ? null : Number(rawValue))
                }}
            />
        </label>
    )
}

function SelectOneEditField<T extends string>({
    field,
}: {
    field: Field<T, SelectOneField<T>>
}) {
    const options = recordToList(field.options)
    const value = field.get()

    const handleChange = (nextRawValue: string) => {
        if (nextRawValue === '') {
            field.set(null)
            return
        }

        const nextValue = options.find(([option]) =>
            String(option) === nextRawValue
        )?.[0]

        if (nextValue !== undefined) {
            field.set(nextValue)
        }
    }

    return (
        <div>
            <label>
                {field.label}
                <select
                    value={value === null ? '' : String(value)}
                    onChange={event => handleChange(event.target.value)}
                >
                    <option value="">No change</option>
                    {options.map(([option, optionLabel]) => (
                        <option key={option} value={option}>
                            {optionLabel}
                        </option>
                    ))}
                </select>
            </label>
        </div>
    )
}

function SelectMultipleEditField<T extends string>({
    field,
}: {
    field: Field<T[], SelectMultipleField<T>>
}) {
    const currentValue = field.get()
    const value = currentValue ?? []

    const handleChange = (option: T, checked: boolean) => {
        const nextValues = checked
            ? [...value, option]
            : value.filter((item) => item !== option);

        field.set(nextValues);
    }

    return (
        <div>
            <span>{field.label}</span>
            <div className="flex flex-wrap gap-3">
                <label>
                    <input
                        type="checkbox"
                        checked={currentValue === null}
                        onChange={event =>
                            field.set(event.target.checked ? null : [])
                        }
                    />
                    <span>No change</span>
                </label>
                {recordToList(field.options).map(([option, optionLabel]) => (
                    <label key={option}>
                        <input
                            type="checkbox"
                            checked={value.includes(option)}
                            onChange={event =>
                                handleChange(option, event.target.checked)
                            }
                        />
                        <span>{optionLabel}</span>
                    </label>
                ))}
            </div>
        </div>
    )
}

export {
    BooleanEditField,
    TextEditField,
    NumberEditField,
    SelectOneEditField,
    SelectMultipleEditField,
    SelectEditComponent,
}
