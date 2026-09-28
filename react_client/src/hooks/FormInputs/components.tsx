import { type ChangeEvent, type SubmitEvent, type ReactNode } from 'react'

import { List } from "@/shared";
import { recordToList } from '@/utils/funcs'

import type { 
    Binding,
    BooleanFieldDef,
    TextFieldDef,
    NumberFieldDef,
    SelectOneFieldDef,
    SelectMultipleFieldDef,
    FieldDef,
    FieldDefs,
    FormInputs,
    PasswordFieldDef,
    EmailFieldDef,
    FieldValues,
} from './schema';
import { kind } from './schema';


export {
    BooleanField,
    TextField,
    TextAreaField,
    NumberField,
    EmailField,
    PasswordField,
    SelectOneField,
    SelectMultipleField,
    ErrorMsg,
    FormInputsContainer,
    FormInputsField,
    FormInputsForm,
};


function BooleanField({ binding }: {
    binding: Binding<BooleanFieldDef>
}) {
    const { get, set, label } = binding;
    return (
        <label>
            <input
                type="checkbox"
                checked={!!get()}
                onChange={event => set(event.target.checked)}
            />
            {label}
        </label>
    );
}

function TextField({ 
    binding, readOnly=false, type='text',
}: {
    binding: Binding<TextFieldDef | EmailFieldDef | PasswordFieldDef>
    readOnly?: boolean;
    type?: 'text' | 'email' | 'password';

}) {
    const { label, placeholder, get, set } = binding;
    return (
        <label>
            {label}
            <input
            type={type}
            placeholder={placeholder}
            value={get() ?? ''}
            readOnly={readOnly}
            onChange={event =>
                set(event.target.value || null)
            }/>
        </label>
    )
}

function TextAreaField({ 
    binding, readOnly=false
}: {
    binding: Binding<TextFieldDef>
    readOnly?: boolean;
}) {
    const { label, placeholder, get, set } = binding;
    return (
        <label>
            {label}
            <textarea
            placeholder={placeholder}
            value={get() ?? ''}
            readOnly={readOnly}
            onChange={event => set(event.target.value || null)}
            />
        </label>
    );
}

function NumberField({ 
    binding, positiveInteger = false
 }: {
    binding: Binding<NumberFieldDef>
    positiveInteger?: boolean
}) {
    const { label, step, get, set } = binding;
    const value = get()

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const input = event.currentTarget;
        set(
            input.value === ""
            ? null
            : Number.isNaN(input.valueAsNumber)
                ? null
                : input.valueAsNumber,
        );
    }

    return (
        <label>
            {label}
            <input
                type="number"
                min={positiveInteger ? 0 : undefined}
                step={step}
                value={value === null ? '' : value}
                onChange={event => handleChange(event)}
            />
        </label>
    )
}


function EmailField({ 
    binding, readOnly=false
}: {
    binding: Binding<EmailFieldDef>
    readOnly?: boolean;
}) {
    return (
        <TextField 
        binding={binding} 
        type="email" 
        readOnly={readOnly} 
        />
    );
}

function PasswordField({ 
    binding, readOnly=false
}: {
    binding: Binding<PasswordFieldDef>
    readOnly?: boolean;
}) {
    return (
        <TextField 
        binding={binding} 
        type="password" 
        readOnly={readOnly} 
        />
    );
}

function SelectOneField({ binding }: {
    binding: Binding<SelectOneFieldDef<any>>;
}) {
    const { label, options, get, set } = binding;
    return (
        <label>
            {label}
            <select
            value={get() ?? ""}
            onChange={event => set(event.target.value)}
            >
                <List
                items={recordToList(options) as [string, any][]}
                renderItem={([key, value]) => (
                    <option key={key} value={value}>
                        {binding.labels[key]}
                    </option>
                )}/>
            </select>
        </label>
    )
}

function SelectMultipleField({ binding }: {
    binding: Binding<SelectMultipleFieldDef<any>>;
}) {
    const { get, set, label, options } = binding;
    const currentValue = get();
    const values = currentValue ?? [];

    const handleChange = (value: any, checked: boolean) => {
        const nextValues = checked
            ? [...values, value]
            : values.filter((item) => item !== value);
        set(nextValues);
    }

    return (
        <fieldset>
            <legend>{label}</legend>
            <List
            items={recordToList(options) as [string, any][]}
            renderItem={([key, value]) => (
                <label key={key}>
                    <input
                    type="checkbox"
                    checked={values.includes(value)}
                    onChange={event =>
                        handleChange(value, event.target.checked)
                    }/>
                    {binding.labels[key]}
                </label>
            )}/>
        </fieldset>
    )
}

function ErrorMsg({ message }: { 
    message: string | null 
}) {
    if (!message) return null;
    return (
        <p className="text-sm text-red-600">
            {message}
        </p>
    );
}

function FormInputsContainer({ 
    children, submit 
}:{
    children: ReactNode,
    submit?: (event: SubmitEvent<HTMLFormElement>) => void
}) {
    return (
        <form 
        onSubmit={event => {
            event.preventDefault();
            submit?.(event);
        }}
        >
            {children}
        </form>
    )
}

function FormInputsField({ binding }: {
  binding: Binding<FieldDef>;
}) {
  switch (binding.kind) {
    case kind.boolean: return <BooleanField binding={binding} />;
    case kind.text: return <TextField binding={binding} />;
    case kind.email: return <EmailField binding={binding} />;
    case kind.password: return <PasswordField binding={binding} />;    
    case kind.number: return <NumberField binding={binding} />;
    case kind.selectOne: return <SelectOneField binding={binding} />;
    case kind.selectMultiple: return <SelectMultipleField binding={binding} />;
    default: throw new Error("Unsupported field kind");
  }
}

function FormInputsForm({
    formInputs, onSubmit, submitLabel="Submit", hasResetButton=false
}: {
    formInputs: FormInputs<FieldDefs, FieldValues<FieldDefs>>
    onSubmit: ( event: SubmitEvent<HTMLFormElement>) => void,
    submitLabel?: string,
    hasResetButton?: boolean,
}) {
    const { 
        bindings, errorMsg, reset,
    } = formInputs;
    return (
        <FormInputsContainer submit={onSubmit}>
            <List
            items={recordToList(bindings)}
            renderItem={([_, binding]) => 
                <FormInputsField
                binding={binding} 
                key={binding.fieldKey} 
                />
            }/>

            <ErrorMsg message={errorMsg} />

            <button type="submit" >
                {submitLabel}
            </button>
            
            {hasResetButton && (
            <button
            type="button"
            onClick={reset}
            >
                Reset
            </button>
            )}
        </FormInputsContainer>
    )
}