import { useEffect, useState, type ReactNode } from 'react'

import { XMarkIcon, List } from "@/shared";
import { recordToList, recordValues } from '@/utils/funcs'

import type { 
    Binding,
    BooleanFieldDef,
    SelectOneFieldDef,
    SelectMultipleFieldDef,
    TextFieldDef,
    Bindings,
    FieldDef,
    FieldDefs,
    QueryParams,
} from './schema';
import { kind } from './schema';


export {
    BooleanField,
    SelectOneField,
    SelectMultipleField,
    TextField,
    QueryParamsContainer,
    QueryParamField,
    QueryParamFields,
};


function BooleanField({ binding }: {
    binding: Binding<BooleanFieldDef>;
}) {
    return (
        <label htmlFor={binding.fieldKey}>
            <input
                id={binding.fieldKey}
                type="checkbox"
                checked={binding.get()}
                onChange={(event) => {
                    binding.set(event.target.checked);
                }}
            />
            <span>{binding.label}</span>
        </label>
    );
}

function SelectOneField({ binding }: {
    binding: Binding<SelectOneFieldDef<any>>;
}) {
    return (
        <div>
            <label htmlFor={binding.fieldKey}>{binding.label}</label>
            <select
            id={binding.fieldKey}
            name={binding.fieldKey}
            value={binding.get()}
            onChange={(event) => {
                binding.set(event.target.value);
            }}
            >
                <List
                items={recordToList(binding.options) as [string, string][]}
                renderItem={([key, value]) => (
                    <option key={key} value={value}>
                        {binding.labels[key]}
                    </option>
                )}
                />
            </select>
        </div>
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
        <div>
            <span>{binding.label}</span>
            <List
            items={recordToList(binding.options) as [string, string][]}
            renderItem={([key, value]) => (
                <label key={key}>
                    <input
                        type="checkbox"
                        checked={selected.includes(value)}
                        onChange={(event) => handleChange(value, event.target.checked)}
                    />
                    <span>{binding.labels[key]}</span>
                </label>
            )}
            />
            <XMarkIcon 
            onClick={() => binding.set(() => [])} 
            />
        </div>
    );
}

function TextField({ binding }: {
    binding: Binding<TextFieldDef>;
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
        <div className='flex'>
            <label htmlFor={binding.fieldKey}>{binding.label}</label>
            <input
            className="w-full rounded border border-slate-300 p-2"
            id={binding.fieldKey}
            name={binding.fieldKey}
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={({key}) => key==="Enter" ? handleSearch() : null}
            onBlur={handleSearch}
            />
            <XMarkIcon 
            onClick={() => { 
                setSearchInput('')
                binding.set(() => '')
            }} />
        </div>
    );
}

function QueryParamsContainer({ children }:{
    children: ReactNode
}) {
    return (
        <div>
            {children}
        </div>
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
            <List
            items={recordValues(bindings)}
            renderItem={(binding) => 
                <QueryParamField 
                binding={binding} 
                key={binding.fieldKey} 
                />
            }/>
        </QueryParamsContainer>
    )
}