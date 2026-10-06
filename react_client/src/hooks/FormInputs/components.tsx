import { type ChangeEvent, type SubmitEvent, type ReactNode } from 'react'

import { 
    FieldSet, 
    Form, 
    Label, 
    LabeledInput, 
    Legend, 
    List, 
    Select, 
    TextArea,
    ErrorMsg,
    Button, 
} from "@/shared";
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
    FormInputsContainer,
    FormInputsField,
    FormInputsForm,
};


function BooleanField({ binding }: {
    binding: Binding<BooleanFieldDef>
}) {
    const { get, set, label } = binding;
    return (
        <LabeledInput
        before={false}
        type="checkbox"
        checked={!!get()}
        onChange={event => set(event.target.checked)}
        >
            {label}
        </LabeledInput>
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
        <LabeledInput
        type={type}
        placeholder={placeholder}
        value={get() ?? ''}
        readOnly={readOnly}
        onChange={event =>
            set(event.target.value || null)
        }
        >
            {label}
        </LabeledInput>
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
    <Label>
        {label}
        <TextArea
        placeholder={placeholder}
        value={get() ?? ''}
        readOnly={readOnly}
        onChange={event => set(event.target.value || null)}
        />
    </Label>
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
        <LabeledInput
        before={false}
        type="number"
        min={positiveInteger ? 0 : undefined}
        step={step}
        value={value === null ? '' : value}
        onChange={event => handleChange(event)}
        >
            {label}
        </LabeledInput>
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
    <Label>
        {label}
        <Select
        value={get() ?? ""}
        onChange={event => set(event.target.value)}
        >
            <List
            items={recordToList(options) as [string, any][]}
            render={([key, value]) => (
                <option key={key} value={value}>
                    {binding.labels[key]}
                </option>
            )}/>
        </Select>
    </Label>
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
    <FieldSet>
        <Legend>{label}</Legend>
        <List
        items={recordToList(options) as [string, any][]}
        render={([key, value]) => (
            <LabeledInput 
            before={false}
            type="checkbox"
            checked={values.includes(value)}
            onChange={event =>
                handleChange(value, event.target.checked)
            }>
                {binding.labels[key]}
            </LabeledInput>
        )}/>
    </FieldSet>
    )
}

function FormInputsContainer({ 
    children, submit 
}:{
    children: ReactNode,
    submit?: (event: SubmitEvent<HTMLFormElement>) => void
}) {
    return (
        <Form 
        onSubmit={event => submit?.(event)}
        >
            {children}
        </Form>
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
    formInputs, submitLabel="Submit", hasResetButton=false
}: {
    formInputs: FormInputs<FieldDefs, FieldValues<FieldDefs>>
    submitLabel?: string,
    hasResetButton?: boolean,
}) {
    const { 
        bindings, errorMsg, reset, handleSubmit,
    } = formInputs;
    return (
    <FormInputsContainer submit={handleSubmit}>
        <List
        items={recordToList(bindings)}
        render={([_, binding]) => 
            <FormInputsField
            binding={binding} 
            key={binding.fieldKey} 
            />
        }/>

        <ErrorMsg errorMsg={errorMsg} />

        <Button type="submit" >
            {submitLabel}
        </Button>
        
        {hasResetButton && (
        <Button
        type="button"
        onClick={reset}
        >
            Reset
        </Button>
        )}
    </FormInputsContainer>
    )
}