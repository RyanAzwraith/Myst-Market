import type { 
    ReactNode, 
    InputHTMLAttributes,
    Ref,
    TextareaHTMLAttributes,
    SelectHTMLAttributes,
    MouseEvent,
} from "react"

export {
    ButtonWrapper,
    Button,
    Input,
    TextArea,
    LabeledInput,
    Select,
}


function ButtonWrapper({
    onClick, children
}: {
    onClick?: () => void, 
    children: React.ReactNode
}) {
    return (
        <button
        onClick={onClick}
        children={children}
        />
    )
}

function Button({
    children,
    type = "button",
    variant = "primary",
    disabled = false,
    onClick
}: {
    children: ReactNode
    type?: "button" | "submit" | "reset"
    variant?: "primary" | "secondary" | "danger" | "ghost"
    disabled?: boolean
    onClick?: (event: MouseEvent<HTMLButtonElement>) => void
}) {
    const variants = {
        primary: "bg-blue-600 text-white hover:bg-blue-700",
        secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300",
        danger: "bg-red-600 text-white hover:bg-red-700",
        ghost: "bg-transparent hover:bg-gray-100"
    }

    return (
        <button
            type={type}
            disabled={disabled}
            onClick={onClick}
            className={[
                "rounded px-4 py-2 font-medium",
                variants[variant],
                disabled && "cursor-not-allowed opacity-50"
            ].join(" ")}
        >
            {children}
        </button>
    )
}

function Input({
    type = "text",
    className,
    ref,
    ...props
}: InputHTMLAttributes<HTMLInputElement> & {
    type?: "text" | "email" | "password" | "number" | "file" | "checkbox"
    ref?: Ref<HTMLInputElement>
}) {
    const styles = {
        text: "w-full rounded border px-3 py-2",
        email: "w-full rounded border px-3 py-2",
        password: "w-full rounded border px-3 py-2",
        number: "w-full rounded border px-3 py-2",
        file: "w-full rounded border px-3 py-2",
        checkbox: "w-full rounded border px-3 py-2",
    }

    return (
        <input
        ref={ref}
        {...props}
        type={type}
        className={`${styles[type] ?? styles.text} ${className ?? ""}`}
        />
    )
}

function TextArea({
    className,
    ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
    return (
        <textarea
        {...props}
        className={[
            "w-full rounded border px-3 py-2",
            "focus:outline-none focus:ring-2",
            className
        ].filter(Boolean).join(" ")}
        />
    )
}

function LabeledInput({
    children, id, type = "text", className, before=true, ...props
}: InputHTMLAttributes<HTMLInputElement> & {
    children: ReactNode,
    type?: "text" | "email" | "password" | "number" | "file" | "checkbox",
    before?: boolean,
}) {
    return (
    <label 
    className="flex items-center gap-2" 
    htmlFor={id}
    >
        {before && <span>{children}</span>}
        <Input
        id={id}
        type={type}
        className={className}
        {...props}
        />
        {!before && <span>{children}</span>}
    </label>
    )
}

function Select({
    className,
    children,
    ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
    return (
        <select
        {...props}
        className={[
            "w-full rounded border px-3 py-2",
            "focus:outline-none focus:ring-2",
            className
        ].filter(Boolean).join(" ")}
        children={children}
        />
    )
}

