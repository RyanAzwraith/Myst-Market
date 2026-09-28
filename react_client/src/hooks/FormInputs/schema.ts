import type { 
    Dispatch, 
    SetStateAction, 
    SubmitEvent 
} from "react";

export type {
    FieldValues,
    FieldDefs,
    FieldDef,
    FieldValue,
    FormInputs,
    Bindings,
    Binding,

    BooleanFieldDef,
    TextFieldDef,
    EmailFieldDef,
    PasswordFieldDef,
    NumberFieldDef,
    SelectOneFieldDef,
    SelectMultipleFieldDef,
}
export {
    kind
};

const kind = {
    boolean: "boolean",
    text: "text",
    number: "number",
    email: "email",
    password: "password",
    selectOne: "selectOne",
    selectMultiple: "selectMultiple",
} as const;


type BooleanFieldDef =  {
    kind: typeof kind.boolean;
    label?: string;
    validate?: (value: boolean | null) => string | null;
    initial?: boolean;
    defaultValue: boolean;
};

type TextFieldDef = {
    kind: typeof kind.text;
    label?: string;
    validate?: (value: string | null) => string | null;
    placeholder?: string;
    initial?: string;
    defaultValue?: string;
};

type NumberFieldDef = {
    kind: typeof kind.number;
    label?: string;
    validate?: (value: number | null) => string | null;
    step?: number;
    initial?: number;
    defaultValue?: number;
};

type EmailFieldDef = {
    kind: typeof kind.email;
    label?: string;
    validate?: (value: string | null) => string | null;
    placeholder?: string;
    initial?: string;
    defaultValue?: string;
};

type PasswordFieldDef = {
    kind: typeof kind.password;
    label?: string;
    validate?: (value: string | null) => string | null;
    placeholder?: string;
    initial?: string;
    defaultValue?: string;
};

type SelectOneFieldDef<O extends Record<string, string>> = {
    kind: typeof kind.selectOne;
    defaultValue: O[keyof O];
    options: O;
    labels: { [K in keyof O]: string };
    label?: string;
    validate?: (value: string | null) => string | null;
    initial?: O[keyof O];
};

type SelectMultipleFieldDef<O extends Record<string, string>> = {
    kind: typeof kind.selectMultiple;
    options: O;
    labels: { [K in keyof O]: string };
    label?: string;
    validate?: (value: string[] | null) => string | null;
    initial?: O[keyof O][];
    defaultValue?: O[keyof O][];
};


type FieldDef =
    BooleanFieldDef
    | SelectOneFieldDef<any>
    | SelectMultipleFieldDef<any>
    | TextFieldDef
    | NumberFieldDef
    | EmailFieldDef
    | PasswordFieldDef;

type FieldDefs = Record<string, FieldDef>;


type FieldValue<F extends FieldDef> =
    F extends BooleanFieldDef
    ? boolean | null
    : F extends TextFieldDef
        ? string | null
        : F extends NumberFieldDef
            ? number | null
            : F extends SelectOneFieldDef<infer O>
                ? O[keyof O]  | null
                : F extends SelectMultipleFieldDef<infer O>
                    ? O[keyof O][]  | null
                    : F extends EmailFieldDef
                        ? string | null
                        : F extends PasswordFieldDef
                            ? string | null
                            : never;


type FormInputs<
    F extends FieldDefs,
    S extends FieldValues<F>
> = {
    bindings: Bindings<F>;
    values: FieldValues<F>,
    errorMsg: string | null,
    setErrorMsg: Dispatch<SetStateAction<string | null>>;
    reset: (newInitialValues?: Partial<FieldValues<F>>) => void;
    validate: () => string | null,
    getValidatedValues: () => S | null,
};

type Bindings<F extends FieldDefs> = {
    [K in keyof F]: Binding<F[K]>
};

type Binding<F extends FieldDef> = 
    F extends FieldDef
    ? F & Accessor<FieldValue<F>>
    : never;


type Accessor<V> = {
    get: () => V;
    set: (
        nextValueOrUpdater: V | ((previous: V) => V)
    ) => void;
    fieldKey: string;
};


type FieldValues<F extends FieldDefs> = {
    [K in keyof F]: FieldValue<F[K]>
};


