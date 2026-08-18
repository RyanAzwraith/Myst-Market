import { useState } from 'react'
import { XMarkIcon } from "@heroicons/react/24/solid";

import {recordToList} from '@/utils/funcs'

import type { 
    FilterWithAccessor,
    BooleanFilter,
    SelectOneFilter,
    SelectMultipleFilter,   
    TextFilter,
} from '@/utils/useQueryParams';

function BooleanFilterField({
    accessor,
}: {
    accessor: FilterWithAccessor<boolean, BooleanFilter>;
}) {
    return (
        <label htmlFor={accessor.key}>
            <input
                id={accessor.key}
                type="checkbox"
                checked={accessor.get()}
                onChange={(event) => {
                    accessor.set(event.target.checked);
                }}
            />
            <span>{accessor.label}</span>
        </label>
    );
}

function SelectOneFilterField<T extends string>({
    accessor,
}: {
    accessor: FilterWithAccessor<T, SelectOneFilter<T>>;
}) {

    return (
        <div>
            <label htmlFor={accessor.key}>{accessor.label}</label>
            <select
                id={accessor.key}
                name={accessor.key}
                value={accessor.get()}
                onChange={(event) => {
                    accessor.set(event.target.value as T);
                }}
            >
                {recordToList(accessor.options).map(([option, label]) => (
                    <option key={option} value={option}>
                        {label}
                    </option>
                ))}
            </select>
        </div>
    );
}

function SelectMultipleFilterField<T extends string>({
    accessor,
}: {
    accessor: FilterWithAccessor<T[], SelectMultipleFilter<T>>;
}) {
    const value = accessor.get()

    const handleChange = (option: T, checked: boolean) => {
        const nextValues = checked
            ? [...value, option]
            : value.filter((item) => item !== option);

        accessor.set(nextValues);
    };

    return (
        <div>
            <span>{accessor.label}</span>
            <div className="flex flex-wrap gap-3">
                {recordToList(accessor.options).map(([option, label]) => (
                    <label key={option}>
                        <input
                            type="checkbox"
                            checked={value.includes(option)}
                            onChange={(event) => handleChange(option, event.target.checked)}
                        />
                        <span>{label}</span>
                    </label>
                ))}
            </div>
                        
            <XMarkIcon 
            aria-label='xmarkicon'
            className="h-6 w-6" 
            onClick={() => accessor.set(() => [])} 
            />
        </div>
    );
}

function TextFilterField({
    accessor
}: {
    accessor: FilterWithAccessor<string, TextFilter>
}) {
    const [searchInput, setSearchInput] = useState('')

    function handleSearch() {
        accessor.set(() => searchInput)
    }
    return (
        <div className='flex'>
            <label htmlFor={accessor.key}>{accessor.label}</label>
            <input
                className="w-full rounded border border-slate-300 p-2"
                id={accessor.key}
                name={accessor.key}
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={({key}) => key==="Enter" ? handleSearch() : null}
                onBlur={handleSearch}
            />
            <XMarkIcon 
            aria-label='xmarkicon'
            className="h-6 w-6" 
            onClick={() => { 
                setSearchInput('')
                accessor.set(() => '')
            }} />
        </div>
    );
}

function QueryParamsContainer({
    children
}:{
    children: React.ReactNode
}) {
    return (
        <div>
            {children}
        </div>
    )
}

export {
    BooleanFilterField,
    SelectOneFilterField,
    SelectMultipleFilterField,
    TextFilterField,
    QueryParamsContainer
};
