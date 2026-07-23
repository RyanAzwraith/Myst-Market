
function InputLabelComponent( props: {
    name: string
    children: React.ReactNode
}) {
    return (
        <label 
        className="block text-sm text-slate-700"
        htmlFor={props.name}
        >
            <span className="mb-1 block">{props.name}</span>
                {props.children}
        </label>
    );
}

export {InputLabelComponent}



