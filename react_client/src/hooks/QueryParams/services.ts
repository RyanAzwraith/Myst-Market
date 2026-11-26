import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom'

import { mapRecord } from '@/utils/funcs'

import type {
    FieldValues,
    FieldDefs,
    FieldDef,
    FieldCodec,
    FieldValue,
    QueryParams,
    Bindings,
    Binding,
} from './schema'

import { kind } from './schema'


export {
    useQueryParams,
    bindField,
    matchCodecs,
}


function useQueryParams<F extends FieldDefs>(
    fields: F,
    basePath: string,
): QueryParams<F> {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const urlParams = React.useMemo(() => 
        new URLSearchParams(searchParams)
    , [searchParams]);

    const navigateToParams = React.useCallback((
        nextUrlParams = urlParams,
    ) => {
        const nextParams = new URLSearchParams(nextUrlParams);
        for (const [key, value] of nextParams) {
            if (!value) nextParams.delete(key);
        }
        const query = nextParams.toString();
        navigate(query ? `${basePath}?${query}` : basePath);
    }, [basePath, navigate, urlParams]);

    const bindings = React.useMemo(() =>
        mapRecord(fields, (field, key) =>
            bindField({
                urlParams,
                navigate: navigateToParams,
                fieldKey:key,
                field
            })
        ) as unknown as Bindings<F>
    , [fields, urlParams, navigateToParams] );

    const values = React.useCallback( () => 
        mapRecord(fields, (_, key) =>
            bindings[key as keyof F].get(),
        ) as FieldValues<F>
    , [fields, bindings]);

    return {
        bindings,
        values,
    };
}

function bindField<F extends FieldDef>({
    urlParams, navigate, fieldKey, field
}: {
    urlParams: URLSearchParams;
    navigate: (urlParams?: URLSearchParams) => void;
    fieldKey: string;
    field: F;
}): Binding<F> {
    const { parse, serialize } = matchCodecs(field);

    const get = (): FieldValue<F> => parse(urlParams.get(fieldKey));

    const set = (
        nextValueOrUpdater:
            | FieldValue<F>
            | ((prevValue: FieldValue<F>) => FieldValue<F>)
    ) => {
        const next = typeof nextValueOrUpdater === "function"
            ?   (
                    nextValueOrUpdater as 
                    (prevValue: FieldValue<F>) => FieldValue<F>
                )(get())
            : nextValueOrUpdater;
        const serialized = serialize(next);
        const nextUrlParams = new URLSearchParams(urlParams);
        if (serialized)
            nextUrlParams.set(fieldKey, serialized);
        else
            nextUrlParams.delete(fieldKey);
        navigate(nextUrlParams);
    };

    return { ...field, get, set, fieldKey } as Binding<F>;
}

function matchCodecs<F extends FieldDef>(
    field: F
): FieldCodec<FieldValue<F>> {
  switch (field.kind) {
    case kind.boolean: return {
        parse: (value: string | null) => value === "true",
        serialize: (value: boolean) => value ? "true" : "",
    } as unknown as FieldCodec<FieldValue<F>>;

    case kind.selectOne: { 
        type Value = (typeof field.options)[keyof typeof field.options];;
        return {
            parse: (value: string | null) =>
                value !== null && Object.values(field.options).includes(value)
                ? value as Value
                : field.defaultValue,
            serialize: (value: Value) => String(value)
        } as unknown as FieldCodec<FieldValue<F>>
    }

    case kind.selectMultiple: {
        type Value = (typeof field.options)[keyof typeof field.options];
        return {
            parse: (value: string | null): Value[] =>
            value ? value.split(",").filter(
                item => Object.values(field.options).includes(item)
                ) : [],
            serialize: (value: Value[]) =>  value.join(","),
        } as unknown as FieldCodec<FieldValue<F>>;
    }

    case kind.text: return {
        parse: (value: string | null) => value ?? "",
        serialize: (value: string) => value,
    } as unknown as FieldCodec<FieldValue<F>>;

    default:
      throw new Error("Unsupported field kind")
  }
}
