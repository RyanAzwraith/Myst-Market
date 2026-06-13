


function InputFieldComponent(props: {
    label: string;
    value: string;
    setValue: (value: string) => void;
    inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
}) {
    return (
        <label className="block text-sm text-slate-700">
            <span className="sr-only">{props.label}</span>

            <input
                value={props.value}
                onChange={(e) => props.setValue(e.target.value)}
                className="w-full border p-2"
                placeholder={props.label}
                {...props.inputProps}
            />
        </label>
    );
}

export {InputFieldComponent}



