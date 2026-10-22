import { type ChangeEvent, type ReactNode } from 'react'

import { recordToList } from '@/utils/funcs'
import { 
    Grid, 
    Label, 
    LabeledInput, 
    Legend, 
    List, 
    Select,
    FieldSet,
    Input,
    Button,
    Container,
    Row,
} from "@/shared";

import type { 
    Binding,
    BooleanFieldDef,
    TextFieldDef,
    NumberFieldDef,
    SelectOneFieldDef,
    SelectMultipleFieldDef,
    FieldDef,
    FieldDefs,
    SelectEdit,
} from './schema';
import { kind } from './schema';


export {
    BooleanField,
    TextField,
    NumberField,
    SelectOneField,
    SelectMultipleField,
    ItemRow,
    SelectEditField,
    SelectEditContainer,
    SelectEditDisplay,
};


function BooleanField({ binding }: {
    binding: Binding<BooleanFieldDef>
}) {
    const { get, set, label } = binding;
    
    const value = get()

    const handleChange = (nextRawValue: string) => {
        if (nextRawValue === '') {
            set(null)
            return
        }
        set(nextRawValue === 'true')
    }

    return (
    <Label className={
        "select-edit-boolean-field"
    }>
        {label}
        <Select
        className="select-edit-control"
        value={value === null ? '' : String(value)}
        onChange={event => handleChange(event.target.value)}
        >
            <option value="">No change</option>
            <option value="true">True</option>
            <option value="false">False</option>
        </Select>
    </Label>
    )
}

function TextField({ binding }: {
    binding: Binding<TextFieldDef>
}) {
    const { label, placeholder, get, set } = binding;
    return (
        <LabeledInput
        type="text"
        labelClassName={
            "select-edit-text-field"
        }
        className="select-edit-control"
        placeholder={placeholder}
        value={get() ?? ''}
        onChange={event =>
            set(event.target.value || null)
        }
        >
            {label}
        </LabeledInput>
    )
}

function NumberField({ binding }: {
    binding: Binding<NumberFieldDef>
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
        type="number"
        labelClassName={
            "select-edit-number-field"
        }
        className="select-edit-control"
        step={step}
        value={value === null ? '' : value}
        onChange={event => handleChange(event)}
        >
            {label}
        </LabeledInput>
    )
}

function SelectOneField({ binding }: {
    binding: Binding<SelectOneFieldDef<any>>;
}) {
    const { label, options, get, set } = binding;

    const optionsList = recordToList(options)
    const value = get()

    const handleChange = (nextRawValue: string) => {
        if (nextRawValue === '') {
            set(null)
            return
        }

        const nextValue = optionsList.find(([, value]) =>
            String(value) === nextRawValue
        )?.[1]

        if (nextValue !== undefined) {
            set(nextValue)
        }
    }

    return (
    <Label className={
        "select-edit-select-one-field"
    }>
        {label}
        <Select
        className="select-edit-control"
        value={value === null ? '' : String(value)}
        onChange={event => handleChange(event.target.value)}
        >
            <option value={""}>No change</option>
            <List
            items={optionsList as [string, any][]}
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
    <FieldSet className="select-edit-select-multiple-field">
        <Legend className="select-edit-legend">
            {label}
        </Legend>

        <LabeledInput
        before={false}
        type="checkbox"
        labelClassName="select-edit-option-label"
        checked={currentValue === null}
        onChange={event =>
            set(event.target.checked ? null : [])
        }>
            No change
        </LabeledInput>

        <List
        items={recordToList(options) as [string, any][]}
        render={([key, value]) => (
            <LabeledInput
            key={`option-${key}`}
            before={false}
            type="checkbox"
            labelClassName="select-edit-option-label"
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

function ItemRow({
    children, id, selectEdit,
}: {
    children?: ReactNode,
    id: number,
    selectEdit: SelectEdit<any>,
}) {    
    return (
    <Row className="select-edit-item-row">
        <Input
        type="checkbox"
        checked={selectEdit.selectedIds.has(id)}
        onChange={() => selectEdit.toggleSelect(id)}
        />
        {children}
    </Row>
    )
}


function SelectEditContainer({ children }:{
    children: ReactNode
}) {
    return (
    <FieldSet className={
        "select-edit-container"
    }
    >
        {children}
    </FieldSet>
    )
}

function SelectEditField({ binding }: {
  binding: Binding<FieldDef>;
}) {
  switch (binding.kind) {
    case kind.boolean: return <BooleanField binding={binding} />;
    case kind.text: return <TextField binding={binding} />;
    case kind.number: return <NumberField binding={binding} />;
    case kind.selectOne: return <SelectOneField binding={binding} />;
    case kind.selectMultiple: return <SelectMultipleField binding={binding} />;
    default: throw new Error("Unsupported field kind");
  }
}

function SelectEditDisplay<F extends FieldDefs>({
    selectEdit
}:{
    selectEdit: SelectEdit<F>
}) {
    const { bindings, isAllSelected, toggleSelectAll, selectedIds, submit } = selectEdit;
    return (
    <SelectEditContainer >
        <LabeledInput
        before={false}
        type="checkbox"
        labelClassName={
            "select-edit-select-all"
        }
        checked={isAllSelected}
        onChange={toggleSelectAll}
        >
            Select all
        </LabeledInput>
        
        <List
        items={recordToList(bindings)}
        render={([_, binding]) => 
            <SelectEditField 
            binding={binding} 
            key={binding.fieldKey} 
            />
        }/>

        <Button
        type="button"
        className="select-edit-submit"
        onClick={submit}
        disabled={selectedIds.size === 0}
        >
            Update selected
        </Button>
    </SelectEditContainer>
    )
}