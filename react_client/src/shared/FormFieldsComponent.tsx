import type { ReactNode } from 'react';

import { recordToList } from '@/utils/funcs';
import type {
    BooleanField,
    Field,
    NumberField,
    SelectMultipleField,
    SelectOneField,
    TextField,
} from '@/utils/useFormFields';

function FormFieldsContainer({ children }: { children: ReactNode }) {
    return <div>{children}</div>;
}

function BooleanFormField({
    field,
}: {
    field: Field<boolean, BooleanField>;
}) {
    return (
        <label>
            <input
                type="checkbox"
                checked={field.get()}
                onChange={event => field.set(event.target.checked)}
            />
            {field.label}
        </label>
    );
}

function TextFormField({
    field,
    type = 'text',
    readOnly = false,
}: {
    field: Field<string, TextField>;
    type?: 'text' | 'email' | 'password';
    readOnly?: boolean;
}) {
    return (
        <label>
            {field.label}
            <input
                type={type}
                placeholder={field.placeholder}
                value={field.get()}
                readOnly={readOnly}
                onChange={event => field.set(event.target.value)}
            />
        </label>
    );
}

function TextAreaFormField({
    field,
}: {
    field: Field<string, TextField>;
}) {
    return (
        <label>
            {field.label}
            <textarea
                placeholder={field.placeholder}
                value={field.get()}
                onChange={event => field.set(event.target.value)}
            />
        </label>
    );
}

function EmailFormField({
    field,
    readOnly = false,
}: {
    field: Field<string, TextField>;
    readOnly?: boolean;
}) {
    return <TextFormField field={field} type="email" readOnly={readOnly} />;
}

function PasswordFormField({
    field,
}: {
    field: Field<string, TextField>;
}) {
    return <TextFormField field={field} type="password" />;
}

function NumberFormField({
    field,
    positiveInteger = false,
}: {
    field: Field<number, NumberField>;
    positiveInteger?: boolean;
}) {
    return (
        <label>
            {field.label}
            <input
                type="number"
                min={positiveInteger ? 1 : undefined}
                step={positiveInteger ? 1 : field.step}
                value={field.get()}
                onChange={event => field.set(Number(event.target.value))}
            />
        </label>
    );
}

function PositiveIntegerFormField({
    field,
}: {
    field: Field<number, NumberField>;
}) {
    return <NumberFormField field={field} positiveInteger />;
}

function SelectOneFormField<T extends string>({
    field,
}: {
    field: Field<T, SelectOneField<T>>;
}) {
    return (
        <label>
            {field.label}
            <select
                value={field.get()}
                onChange={event => field.set(event.target.value as T)}
            >
                {recordToList(field.options).map(([option, label]) => (
                    <option key={option} value={option}>
                        {label}
                    </option>
                ))}
            </select>
        </label>
    );
}

function SelectMultipleFormField<T extends string>({
    field,
}: {
    field: Field<T[], SelectMultipleField<T>>;
}) {
    const value = field.get();

    return (
        <fieldset>
            <legend>{field.label}</legend>
            {recordToList(field.options).map(([option, label]) => (
                <label key={option}>
                    <input
                        type="checkbox"
                        checked={value.includes(option)}
                        onChange={event => {
                            const nextValue = event.target.checked
                                ? [...value, option]
                                : value.filter(item => item !== option);
                            field.set(nextValue);
                        }}
                    />
                    {label}
                </label>
            ))}
        </fieldset>
    );
}

export {
    FormFieldsContainer,
    BooleanFormField,
    TextFormField,
    TextAreaFormField,
    EmailFormField,
    PasswordFormField,
    NumberFormField,
    PositiveIntegerFormField,
    SelectOneFormField,
    SelectMultipleFormField,
};