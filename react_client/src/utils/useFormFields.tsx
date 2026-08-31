import React from 'react';

type FieldValue = null | boolean | string | number | string[];
type Validator<T> = (value: T) => string | null;

type Field<T, F> = F & {
    get: () => T;
    set: (value: T | ((previous: T) => T)) => void;
};

type FieldDefinition<T> = {
    label?: string;
    initial?: T;
    validate?: Validator<T>;
};

type CreateField<T extends FieldValue, F> = ((
    key: string,
    fieldValues: Record<string, FieldValue>,
    setFieldValues: React.Dispatch<
        React.SetStateAction<Record<string, FieldValue>>
    >,
) => Field<T, F>) & F;

type FieldFactories = Record<string, CreateField<any, any>>;

type FieldValues<T extends FieldFactories> = {
    [K in keyof T]: T[K] extends CreateField<infer V, any> ? V : never;
};

type FieldInitialValues<T extends FieldFactories> = Partial<FieldValues<T>>;

function useFormFields<TFields extends FieldFactories>(
    fields: TFields,
) {
    const initialValues = React.useMemo(
        () => Object.fromEntries(
            Object.entries(fields).map(([key, createField]) => [
                key,
                (createField as FieldDefinition<FieldValue>).initial ??
                    null,
            ]),
        ) as Record<string, FieldValue>,
        [fields],
    );
    const [fieldValues, setFieldValues] = React.useState(initialValues);
    const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

    const accessors = Object.fromEntries(
        Object.entries(fields).map(([key, createField]) => [
            key,
            createField(key, fieldValues, setFieldValues),
        ]),
    ) as {
        [K in keyof TFields]: ReturnType<TFields[K]>;
    };

    const reset = (newInitialValues?: FieldInitialValues<TFields>) => {
        setFieldValues({
            ...initialValues,
            ...(newInitialValues as Record<string, FieldValue> | undefined),
        });
        setErrorMsg(null);
    };

    const validate = () => {
        for (const [key, field] of Object.entries(fields)) {
            const value = fieldValues[key];
            const validation = field.validate?.(value);
            if (validation) {
                setErrorMsg(validation);
                return false;
            }
        }
        setErrorMsg(null);
        return true;
    };

    return {
        ...accessors,
        values: fieldValues as FieldValues<TFields>,
        errorMsg,
        setErrorMsg,
        reset,
        validate,
    };
}

function createFieldFactory<T extends FieldValue, F extends FieldDefinition<T>>(
    field: F,
    defaultValue: T,
): CreateField<T, F> {
    const createField = (
        key: string,
        fieldValues: Record<string, FieldValue>,
        setFieldValues: React.Dispatch<
            React.SetStateAction<Record<string, FieldValue>>
        >) => ({
        ...field,
        get: () => fieldValues[key] as T,
        set: (
            valueOrUpdater: T | ((previous: T) => T),
        ) => setFieldValues(previous => {
            const previousValue = previous[key] as T;
            const value = typeof valueOrUpdater === 'function'
                ? (valueOrUpdater as (previous: T) => T)(previousValue)
                : valueOrUpdater;
            return { ...previous, [key]: value };
        }),
    });

    return Object.assign(createField, {
        ...field,
        initial: field.initial ?? defaultValue,
    }) as CreateField<T, F>;
}

type BooleanField = FieldDefinition<boolean>;
const booleanField = (field: BooleanField = {}) =>
    createFieldFactory<boolean, BooleanField>(field, false);

type TextField = FieldDefinition<string> & { placeholder?: string };
const textField = (field: TextField = {}) =>
    createFieldFactory<string, TextField>(field, '');
const emailField = (field: TextField = {}) =>
    createFieldFactory<string, TextField>(field, '');
const passwordField = (field: TextField = {}) =>
    createFieldFactory<string, TextField>(field, '');

type NumberField = FieldDefinition<number> & { step?: number };
const numberField = (field: NumberField = {}) =>
    createFieldFactory<number, NumberField>(field, 0);
const positiveIntegerField = (field: NumberField = {}) =>
    createFieldFactory<number, NumberField>(field, 0);

type SelectOneField<T extends string> = FieldDefinition<T> & {
    options: Record<T, string>;
};
const selectOneField = <T extends string>(field: SelectOneField<T>) =>
    createFieldFactory<T, SelectOneField<T>>(
        field,
        Object.keys(field.options)[0] as T,
    );

type SelectMultipleField<T extends string> = FieldDefinition<T[]> & {
    options: Record<T, string>;
};
const selectMultipleField = <T extends string>(
    field: SelectMultipleField<T>,
) => createFieldFactory<T[], SelectMultipleField<T>>(field, []);

const validateEmail = (value: string) =>
    !value.trim()
        ? 'Email required'
        : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
            ? 'Invalid email'
            : null;

export {
    useFormFields,
    booleanField,
    textField,
    emailField,
    passwordField,
    numberField,
    positiveIntegerField,
    selectOneField,
    selectMultipleField,
    validateEmail,
};

export type {
    Field,
    FieldValues,
    BooleanField,
    TextField,
    NumberField,
    SelectOneField,
    SelectMultipleField,
};
