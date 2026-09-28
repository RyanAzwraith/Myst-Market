import React, { type Dispatch, type SetStateAction } from 'react';

import { mapRecord } from '@/utils/funcs'

import type {
    FieldValues,
    FieldDefs,
    FieldDef,
    FieldValue,
    SelectEdit,
    Bindings,
    Binding,
} from './schema'

export {
    useSelectEdit,
    bindField,
}


function useSelectEdit<F extends FieldDefs>({ 
    ids, fields, handleSubmit,
}:{
    ids: Set<number>,
    fields: F,
    handleSubmit: (ids: Set<number>, values: FieldValues<F>) =>  void | Promise<void>
}): SelectEdit<F> {
    const [selectedIds, setSelectedIds] = React.useState<Set<number>>(
        () => new Set()
    );

    const [fieldValues, setFieldValues] = React.useState(
        mapRecord(fields, () => null) as FieldValues<F>
    );

    const isSelected = (id: number) => selectedIds.has(id);

    const toggleSelect = (id: number) => {
        if (!ids.has(id)) return;
        setSelectedIds(previous => {
            const next = new Set(previous);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const isAllSelected =
        ids.size > 0 &&
        [...ids].every(id => selectedIds.has(id))

    const toggleSelectAll = () => setSelectedIds(prev => {
        const allSelected =
            ids.size > 0 &&
            [...ids].every(id => prev.has(id));

        return allSelected ? new Set() : new Set(ids);
    });
   
    const bindings = React.useMemo(() =>
        mapRecord(fields, (field, key) =>
            bindField({
                fieldValues,
                setFieldValues,
                fieldKey: key,
                field
            })
        ) as unknown as Bindings<F>
    , [fields, fieldValues] );

    const submit = () => handleSubmit(
        new Set(
            [...selectedIds].filter(id => ids.has(id)),
        ),
        fieldValues
    );

    return {
        bindings,
        selectedIds,
        isSelected,
        toggleSelect,
        isAllSelected,
        toggleSelectAll,
        submit
    };
}

function bindField<
  FS extends FieldDefs,
  F extends FieldDef
>({
    fieldValues, setFieldValues, fieldKey, field
}: {
    fieldValues: FieldValues<FS>;
    setFieldValues: Dispatch<SetStateAction<FieldValues<FS>>>;
    fieldKey: string;
    field: F;
}): Binding<F> {
    const get = (): FieldValue<F> => 
        fieldValues[fieldKey as keyof FS] as unknown as FieldValue<F>;

    const set = (
        nextValueOrUpdater:
            | (FieldValue<F>)
            | ((prevValue: FieldValue<F>) => FieldValue<F>)
    ) => setFieldValues((prev: FieldValues<FS>) => {
            const nextValue = typeof nextValueOrUpdater === 'function'
                ? (nextValueOrUpdater as (prevValue: FieldValue<F>) => FieldValue<F>)(
                    prev[fieldKey as keyof FS] as unknown as FieldValue<F>
                )
                : nextValueOrUpdater;
            return { ...prev, [fieldKey]: nextValue };
        });

    return { ...field, get, set, fieldKey }  as unknown as Binding<F>;
}
