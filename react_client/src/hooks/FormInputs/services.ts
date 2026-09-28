import type { 
    SubmitEvent,
    Dispatch,
    SetStateAction,
} from 'react';

import { 
    useMemo, 
    useState, 
} from 'react';

import { mapRecord } from '@/utils/funcs'

import type {
    FieldValues,
    FieldDefs,
    FieldDef,
    FieldValue,
    Bindings,
    Binding,
    FormInputs,
    OnSubmit,
} from './schema'

export {
    useFormInputs,
    bindField,
}


function useFormInputs<
    F extends FieldDefs, 
    S extends FieldValues<F>
>({ 
    fields, onValidate, onSubmit
}:{
    fields: F,
    onValidate?: (values: FieldValues<F>) =>  string | null;
    onSubmit?: OnSubmit<F>
}): FormInputs<F, S> {

    const initialValues = useMemo( () =>
        mapRecord(fields, 
            field => field.initial ?? null
    ) as FieldValues<F>
    , [fields]);

    const [fieldValues, setFieldValues] = 
        useState<FieldValues<F>>(initialValues);

    const [errorMsg, setErrorMsg] = 
        useState<string | null>(null);

    const reset = (newInitialValues?: Partial<FieldValues<F>>) => {
        setFieldValues({
            ...initialValues,
            ...(newInitialValues as Partial<FieldValues<F>>),
        });
        setErrorMsg(null);
    };

    const validate = () => {
        const values = mapRecord(fields, (field, key) => 
            fieldValues[key] ??
            ("defaultValue" in field
                ? field.defaultValue
                : null)
        ) as FieldValues<F>
        
        let error = null;
        for (const [key, field] of Object.entries(fields)) {
            const value = values[key];

            if (field.kind === 'email') error = validateEmail(value);

            error = field.validate?.(value);
            if (error) {
                setErrorMsg(error);
                return error;
            }
        }

        error = onValidate?.(values) ?? null;

        if (error) {
            setErrorMsg(error);
            return error;
        } 
        setErrorMsg(null);
        setFieldValues(values as S);
        return null;
    }

    const handleSubmit = ( event: SubmitEvent<HTMLFormElement> ) => {
        event.preventDefault();
        if (validate()) return;
        onSubmit?.(fieldValues, setErrorMsg, reset);
        reset()
    };

    const bindings = useMemo(() =>
        mapRecord(fields, (field, key) =>
            bindField({
                fieldValues,
                setFieldValues,
                fieldKey: key,
                field
            })
        ) as unknown as Bindings<F>
    , [fields, fieldValues] );

    return {
        bindings,
        values: fieldValues,
        errorMsg,
        setErrorMsg,
        reset,
        validate,
        handleSubmit,
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


const validateEmail = (value: string) =>
    !value?.trim()
        ? 'Email required'
        : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
            ? 'Invalid email'
            : null;
