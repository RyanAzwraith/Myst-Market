import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom'

import { mapRecord } from '@/utils/funcs'

type Accessor<T> = {
    key: string
    get: () => T
    set: (nextValueOrUpdater: T | ((prevValue: T) => T)) => void
};
type FilterWithAccessor<T, F> = F & Accessor<T>

function createFilter<T, F>( {
    params, navigateToParams, key, filter, parse, serialize
} : {
    params: URLSearchParams,
    navigateToParams: () => void,
    key: string,
    filter: F,
    parse: (value: string | null) => T,
    serialize: (value: T) => string,
}): FilterWithAccessor<T, F> {
    const get = () => parse(params.get(key));

    const set = (
        nextValueOrUpdater: T | ((prevValue: T) => T)
    ) => {
        const next = typeof nextValueOrUpdater === "function"
            ? (nextValueOrUpdater as (prev: T) => T)(get())
            : nextValueOrUpdater;
        const serialized = serialize(next);
        if (!serialized)
            params.delete(key);
        else
            params.set(key, serialized);
        navigateToParams();
    }

    return { ...filter, key, get, set }
}

type FilterFactory = (
    params: URLSearchParams,
    navigateToParams: () => void,
    key: string,
) => FilterWithAccessor<any, any>;


type BooleanFilter =  {
    label: string;
};
const booleanFilter = (
    filter: BooleanFilter,
): FilterFactory => (params, navigateToParams, key) =>
    createFilter({
        params, navigateToParams, key, filter,
        parse: (value: string | null) => value === "true",
        serialize:  (value: boolean) => value ? "true" : "",
    })

type SelectOneFilter<T extends string | number> =  {
    label: string;
    defaultValue: T;
    options: Record<T, string>;
}
const selectOneFilter = <T extends string | number> (
    filter: SelectOneFilter<T>,
): FilterFactory => (params, navigateToParams, key) => 
    createFilter({
        params, navigateToParams, key, filter,
        parse: (value) => value && value in filter.options 
            ?  value as T : filter.defaultValue,
        serialize:  value => value.toString(),
    })

type SelectMultipleFilter<T extends string | number> = {
    label: string;
    options: Record<T, string>;
};
const selectMultipleFilter = <T extends string | number> (
    filter: SelectMultipleFilter<T>,
): FilterFactory => (params, navigateToParams, key) => 
    createFilter({
        params, navigateToParams, key, filter,
        parse: (value): T[] => value
            ?  value.split(',').filter(
                v => Object.hasOwn(filter.options, v 
            )) as T[]
            : [],
        serialize: (value: T[]) => value.join(','),
    })

type TextFilter = {
    label: string;
    placeholder?: string;
};
const textFilter = (
    filter: TextFilter,
): FilterFactory => (params, navigateToParams, key) => 
    createFilter({
        params, navigateToParams, key, filter,
        parse: (value) => value ?? '',
        serialize: (value) => value,
    })


type AccessorValue<T> = T extends { get: () => infer V } ? V : never;

type UseQueryParamsResult<T extends Record<string, FilterFactory>> = {
    [K in keyof T]: ReturnType<T[K]>
} & {
    navigateToParams: () => void;
    getParams: () => {
        [K in keyof T]: AccessorValue<ReturnType<T[K]>>
    };
};



function useQueryParams<T extends Record<string, FilterFactory>>(
    filters: T,
    basePath: string,
): UseQueryParamsResult<T> {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const params = React.useMemo(() => 
        new URLSearchParams(searchParams)
    , [searchParams]);

    const navigateToParams = React.useCallback(() => {
        const nextParams = new URLSearchParams(params);
        for (const [key, value] of nextParams) {
            if (!value) nextParams.delete(key);
        }
        const query = nextParams.toString();
        navigate(query ? `${basePath}?${query}` : basePath);
    }, [basePath, navigate, params]);

    const accessors = React.useMemo(() => 
        mapRecord(filters, (createAccessor, key) => 
            createAccessor(params, navigateToParams, key)
        )   
    , [filters, params] );

    const getParams = React.useCallback(
        () => mapRecord(accessors, accessor => accessor.get()),
        [accessors]
    )
    
    return {
        ...accessors,
        navigateToParams,
        getParams,
    } as UseQueryParamsResult<T>;
}


export type {
    FilterWithAccessor,
    BooleanFilter,
    SelectOneFilter,
    SelectMultipleFilter,   
    TextFilter,
};

export {
    booleanFilter,
    selectOneFilter,
    selectMultipleFilter,
    textFilter,
    useQueryParams,
};