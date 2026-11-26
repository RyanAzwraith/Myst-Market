
export type {
    FieldValues,
    FieldDefs,
    FieldDef,
    FieldCodec,
    FieldValue,
    QueryParams,
    Bindings,
    Binding,

    BooleanFieldDef,
    SelectOneFieldDef,
    SelectMultipleFieldDef,
    TextFieldDef,
}
export {
    kind
};

const kind = {
    boolean: "boolean",
    selectOne: "selectOne",
    selectMultiple: "selectMultiple",
    text: "text",
} as const;


type BooleanFieldDef =  {
    kind: typeof kind.boolean;
    label: string;
};

type SelectOneFieldDef<O extends Record<string, string>> = {
    kind: typeof kind.selectOne
    label: string;
    defaultValue: O[keyof O];
    options: O;
    labels: { [K in keyof O]: string };
};
type SelectMultipleFieldDef<O extends Record<string, string>> = {
    kind: typeof kind.selectMultiple;
    label: string;
    options: O;
    labels: { [K in keyof O]: string };
};

type TextFieldDef = {
    kind: typeof kind.text;
    label: string;
    placeholder?: string;
};


type FieldDef =
    BooleanFieldDef
    | SelectOneFieldDef<any>
    | SelectMultipleFieldDef<any>
    | TextFieldDef;

type FieldDefs = Record<string, FieldDef>;


type FieldValue<F extends FieldDef> =
  F extends BooleanFieldDef
    ? boolean
    : F extends SelectOneFieldDef<infer O>
      ? O[keyof O]
      : F extends SelectMultipleFieldDef<infer O>
        ? O[keyof O][]
        : F extends TextFieldDef
          ? string
          : never;

type FieldCodec<V> = {
    parse: (value: string | null) => V;
    serialize(value: V): string;
};


type QueryParams<F extends FieldDefs> = {
    bindings: Bindings<F>;
    values: () => FieldValues<F>;
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
    set: (nextValueOrUpdater: V | ((prevValue: V) => V)) => void;
    fieldKey: string;
};


type FieldValues<P extends FieldDefs> = {
    [K in keyof P]: FieldValue<P[K]>
};


