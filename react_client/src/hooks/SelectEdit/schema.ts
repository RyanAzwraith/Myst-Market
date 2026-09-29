
export type {
    FieldValues,
    FieldDefs,
    FieldDef,
    FieldValue,
    SelectEdit,
    Bindings,
    Binding,

    BooleanFieldDef,
    TextFieldDef,
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
    selectOne: "selectOne",
    selectMultiple: "selectMultiple",
} as const;


type BooleanFieldDef =  {
    kind: typeof kind.boolean;
    label: string;
};

type TextFieldDef = {
    kind: typeof kind.text;
    label: string;
    placeholder?: string;
};

type NumberFieldDef = {
    kind: typeof kind.number;
    label: string;
    step?: number;
};

type SelectOneFieldDef<O extends Record<string, string>> = {
    kind: typeof kind.selectOne
    label: string;
    defaultValue?: O[keyof O];
    options: O;
    labels: { [K in keyof O]: string };
};

type SelectMultipleFieldDef<O extends Record<string, string>> = {
    kind: typeof kind.selectMultiple;
    label: string;
    options: O;
    labels: { [K in keyof O]: string };
};



type FieldDef =
    BooleanFieldDef
    | SelectOneFieldDef<any>
    | SelectMultipleFieldDef<any>
    | TextFieldDef
    | NumberFieldDef;

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
                    :  never;


type SelectEdit<F extends FieldDefs> = {
    bindings: Bindings<F>;
    selectedIds: Set<number>;
    isSelected: (id: number) => boolean;
    toggleSelect: (id: number) => void;
    isAllSelected: boolean;
    toggleSelectAll: () => void;
    submit: () => void;
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


type FieldValues<P extends FieldDefs> = {
    [K in keyof P]: FieldValue<P[K]>
};


