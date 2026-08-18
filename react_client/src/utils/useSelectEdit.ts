import React from 'react';
import { mapRecord } from './funcs';
import type { Dispatch, SetStateAction } from 'react';

type FieldValue =
    | null
    | boolean
    | string
    | number
    | string[]


type Field<T, F> = F & {
    get: () => T | null;
    set: (
        nextValueOrUpdater:
            | (T | null)
            | ((prevValue: T | null) => T | null)
    ) => void;
};  

type CreateField<T extends FieldValue, F> = (
    key: string,
    fieldValues: Record<string, FieldValue | null>,
    setFieldState: Dispatch<SetStateAction<Record<string, FieldValue | null>>>,
) => Field<T, F>;

type FieldFactories = Record<string, CreateField<any, any>>

type FieldAccessors<T extends FieldFactories> = {
    [K in keyof T]: ReturnType<T[K]>
}

type FieldValues<T extends FieldFactories> = {
    [K in keyof T]:
        T[K] extends CreateField<infer V, any>
            ? V | null
            : never
}

function useSelectEdit<
    TFields extends FieldFactories
>({
    ids,
    FieldFactories,
    handleSubmit,
}: {
    ids: Set<string>;
    FieldFactories: TFields;
    handleSubmit: (
        selectedIds: Set<string>,
        fieldValues: FieldValues<TFields>,
    ) => void | Promise<void>;
}) {

    const [selectedIds, setSelectedIds] = React.useState
        <Set<string>> (new Set());

    const [fieldValues, setFieldState] = React.useState
        <Record<string, FieldValue | null>> 
        (mapRecord(FieldFactories, () => null),);

    const isSelected = (id: string) => selectedIds.has(id);

    const toggleSelect = (id: string) => setSelectedIds(prev => {
        const next = new Set(prev);
        if (next.has(id)) 
            next.delete(id);
        else
            next.add(id);
        return next;
    });

    const isAllSelected =
        ids.size > 0 &&
        [...ids].every(id => selectedIds.has(id))

    const toggleSelectAll = () => setSelectedIds(prev => {
        if (ids.size == prev.size) 
            return new Set();
        return new Set(ids);
    })
   


    const accessors = mapRecord(FieldFactories, (createAccessor, key) =>
        createAccessor(key, fieldValues, setFieldState)
    ) as FieldAccessors<TFields>;

    const submit = () => handleSubmit(
        selectedIds, 
        fieldValues as FieldValues<TFields>
    );

    return {
        ...accessors,
        selectedIds,
        isSelected,
        toggleSelect,
        isAllSelected,
        toggleSelectAll,
        submit,
    };


};


function createFieldFactory<T extends FieldValue, F>(
    field: F,
): CreateField<T, F> {
    return (key, fieldValues, setFieldState) => ({
        ...field,
        get: () => fieldValues[key] as T | null,
        set: (
            valueOrUpdater:
                | (T | null)
                | ((prevValue: T | null) => T | null)
        ) => {
            setFieldState(prev => {
                const nextValue = typeof valueOrUpdater === 'function'
                    ? (valueOrUpdater as (prevValue: T | null) => T | null)(
                        prev[key] as T | null
                    )
                    : valueOrUpdater;
                return { ...prev, [key]: nextValue };
            });
        },
    });
}

type BooleanField = {
    label: string;
};
const booleanField = (field: BooleanField) => 
    createFieldFactory<boolean | null, BooleanField>(field);

type TextField = {
    label: string;
    placeholder?: string;
};
const textField = (field: TextField) =>
    createFieldFactory<string | null, TextField>(field);

type NumberField = {
    label: string;
    step?: number;
};
const numberField = (field: NumberField) =>
    createFieldFactory<number | null, NumberField>(field);

type SelectOneField<T extends string> = {
    label: string;
    options: Record<T, string>;
};
const selectOneField = <T extends string>(
    field: SelectOneField<T>,
) => createFieldFactory<T | null, SelectOneField<T>>(field);

type SelectMultipleField<T extends string> = {
    label: string;
    options: Record<T, string>;
};
const selectMultipleField = <T extends string>(
    field: SelectMultipleField<T>,
) => createFieldFactory<T[] | null, SelectMultipleField<T>>(field);

export {
    useSelectEdit,
    booleanField,
    textField,
    numberField,
    selectOneField,
    selectMultipleField,
}
export type {
    Field,
    FieldValues,
    BooleanField,
    TextField,
    NumberField,
    SelectOneField,
    SelectMultipleField,
}