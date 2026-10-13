import { useEffect, useState, type ReactNode } from 'react'

import { 
    XMarkIcon, 
    List, 
    LabeledInput, 
    Label,
    Select,
    Input,
    Container,
    Inline,
    MagnifyingGlassIcon
} from "@/shared";
import { recordToList, recordValues } from '@/utils/funcs'

import type { 
    Binding,
    BooleanFieldDef,
    SelectOneFieldDef,
    SelectMultipleFieldDef,
    TextFieldDef,
    FieldDef,
    FieldDefs,
    QueryParams,
} from './schema';
import { kind } from './schema';
import { twMerge } from 'tailwind-merge';


export {
    BooleanField,
    SelectOneField,
    SelectMultipleField,
    TextField,
    QueryParamsContainer,
    QueryParamField,
    QueryParamFields,
    SearchField,
};


function BooleanField({ binding }: {
    binding: Binding<BooleanFieldDef>;
}) {
    return (
        <LabeledInput
        before={false}
        type="checkbox"
        labelClassName="rounded-lg border border-gray-200 bg-white px-3 py-2"
        checked={binding.get()}
        onChange={(event) => {
            binding.set(event.target.checked);
        }}
        >
            <span>{binding.label}</span>
        </LabeledInput>
    );
}

function SelectOneField({ binding }: {
    binding: Binding<SelectOneFieldDef<any>>;
}) {
    return (
    <Label
    htmlFor={binding.fieldKey}
    className="rounded-lg border border-gray-200 bg-white p-3"
    >
        <span className={
            "mb-1 block text-xs font-semibold uppercase " +
            "tracking-wide text-gray-500"
        }>
            {binding.label}
        </span>
        <Select
        id={binding.fieldKey}
        name={binding.fieldKey}
        value={binding.get()}
        onChange={(event) => {
            binding.set(event.target.value);
        }}
        >
            <List
            items={recordToList(binding.options) as [string, string][]}
            render={([key, value]) => (
                <option key={key} value={value}>
                    {binding.labels[key]}
                </option>
            )}
            />
        </Select>
    </Label>
    );
}

function SelectMultipleField({ binding }: {
    binding: Binding<SelectMultipleFieldDef<any>>;
}) {
    const selected = binding.get()

    const handleChange = (option: string, checked: boolean) => {
        const nextValues = checked
            ? [...selected, option]
            : selected.filter((item) => item !== option);

        binding.set(nextValues);
    };

    return (
    <div className="rounded-lg border border-gray-200 bg-white p-3">
        <div className="mb-2 flex items-center justify-between">
            <span className={
                "text-xs font-semibold uppercase tracking-wide " +
                "text-gray-500"
            }>
                {binding.label}
            </span>
            <XMarkIcon 
            className="h-5 w-5 text-gray-500"
            buttonClassName="rounded p-1 hover:bg-gray-100"
            ariaLabel={`Clear ${binding.label}`}
            onClick={() => binding.set(() => [])} 
            />
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
            <List
            items={recordToList(binding.options) as [string, string][]}
            render={([key, value]) => (
                <LabeledInput
                key={`option-${key}`}
                before={false}
                type="checkbox"
                labelClassName="text-sm"
                checked={selected.includes(value)}
                onChange={(event) => handleChange(
                    value,
                    event.target.checked
                )}
                >
                    {binding.labels[key]}
                </LabeledInput>
            )}
            />
        </div>
    </div>
    );
}

function TextField({ binding, className }: {
    binding: Binding<TextFieldDef>;
    className?: string,
}) {
    const value = binding.get();
    const [searchInput, setSearchInput] = useState(value);

    useEffect(() => {
        setSearchInput(value);
    }, [value]);

    function handleSearch() {
        binding.set(() => searchInput)
    }
    
    return (
    <Label htmlFor={binding.fieldKey} className={className}>
        <Inline
        align="stretch"
        gap="sm"
        wrap
        className="rounded-lg border border-gray-200 bg-white p-3"
        >
            <span className={
                "shrink-0 self-center text-xs font-semibold " +
                "uppercase tracking-wide text-gray-500"
            }>
                {binding.label}
            </span>
            <Input
            id={binding.fieldKey}
            name={binding.fieldKey}
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={({key}) => key==="Enter" ? handleSearch() : null}
            onBlur={handleSearch}
            placeholder={binding.placeholder}
            className="min-w-0 flex-1"
            />
            <XMarkIcon
            className="h-5 w-5 shrink-0 self-center text-gray-500"
            buttonClassName="rounded p-1 hover:bg-gray-100"
            onClick={() => { 
                setSearchInput('')
                binding.set(() => '')
            }} />
        </Inline>
    </Label>
    );
}

function SearchField({ binding, className }: {
    binding: Binding<TextFieldDef>;
    className?: string,
}) {
    const value = binding.get();
    const [searchInput, setSearchInput] = useState(value);

    useEffect(() => {
        setSearchInput(value);
    }, [value]);

    function handleSearch() {
        binding.set(() => searchInput)
    }
    
    return (
    <Inline 
    className={twMerge(
        "w-full rounded-full border-2 border-gray-200 bg-white px-2",
        className
    )}
    gap="none"
    >
        <MagnifyingGlassIcon className="h-5 w-5 text-gray-500" />
        <Input
        className="min-w-0 flex-1 border-0 focus:ring-0"
        id={binding.fieldKey}
        name={binding.fieldKey}
        type="text"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        onKeyDown={({key}) => key==="Enter" ? handleSearch() : null}
        onBlur={handleSearch}
        placeholder={binding.placeholder}
        />
        <XMarkIcon
        className="h-5 w-5 text-gray-500"
        buttonClassName="rounded p-1 hover:bg-gray-100"
        onClick={() => { 
            setSearchInput('')
            binding.set(() => '')
        }} />
    </Inline>
    );
}

function QueryParamsContainer({ children }:{
    children: ReactNode
}) {
    return (
    <Container className="rounded-xl bg-gray-50 p-4 shadow-sm sm:p-6">
        {children}
    </Container>
    )
}

function QueryParamField({ binding }: {
  binding: Binding<FieldDef>;
}) {
  switch (binding.kind) {
    case kind.boolean: return <BooleanField binding={binding} />;
    case kind.selectOne: return <SelectOneField binding={binding} />;
    case kind.selectMultiple: return <SelectMultipleField binding={binding} />;
    case kind.text: return <TextField binding={binding} />;
    default: throw new Error("Unsupported field kind");
  }
}

function QueryParamFields ({queryParams} : {
    queryParams: QueryParams<FieldDefs>
}) {
    const { bindings } = queryParams;
    return (
    <QueryParamsContainer>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <List
            items={recordValues(bindings)}
            render={(binding) => 
                <QueryParamField 
                binding={binding} 
                key={binding.fieldKey} 
                />
            }/>
        </div>
    </QueryParamsContainer>
    )
}