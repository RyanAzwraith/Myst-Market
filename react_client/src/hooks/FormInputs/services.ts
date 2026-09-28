import type { 
    SubmitEvent,
    Dispatch,
    SetStateAction
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
} from './schema'

export {
    useFormInputs,
    bindField,
}


function useFormInputs<
    F extends FieldDefs, 
    S extends FieldValues<F>
>({ 
    fields, handleValidate
}:{
    fields: F,
    handleValidate?: (values: FieldValues<F>) =>  string | null;
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

    const validate = (values?: FieldValues<F>) => {
        let error = null;
        for (const [key, field] of Object.entries(fields)) {
            const value = values?.[key] ?? fieldValues[key];
            let validation = null;
            if (field.kind === 'email') validation = validateEmail(value);
            validation = field.validate?.(value);
            if (validation) {
                setErrorMsg(validation);
                error = validation;
                return error;
            }
        }
        error = handleValidate?.(values ?? fieldValues) ?? null;
        setErrorMsg(error);
        return error;
    };

    const getValidatedValues = () => {
        const values = mapRecord( fields, (field, key) => 
            fieldValues[key as keyof F] ??( 
                "defaultValue" in field
                ? field.defaultValue
                : null
            )
        ) as FieldValues<F>;
        const error = validate(values);
        if (error) return null;
        return values as S; // This is not guaranteed, must test validate function
    }

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
        getValidatedValues,
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
