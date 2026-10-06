import type { 
    ReactNode, 
    InputHTMLAttributes,
    Ref,
    TextareaHTMLAttributes,
    SelectHTMLAttributes,
    MouseEvent,
} from "react"
import { twMerge } from "tailwind-merge"

export {
    ButtonWrapper,
    Button,
    Input,
    TextArea,
    LabeledInput,
    Select,
}


function ButtonWrapper({
    onClick, children, className, type = "button"
}: {
    onClick?: () => void, 
    children: React.ReactNode
    className?: string
    type?: "button" | "submit" | "reset"
}) {
    return (
        <button
        type={type}
        onClick={onClick}
        className={className}
        children={children}
        />
    )
}

function Button({
    className,
    children,
    type = "button",
    variant = "primary",
    disabled = false,
    onClick
}: {
    className?: string
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
        className={twMerge(
            "rounded px-4 py-2 font-medium",
            variants[variant],
            disabled && "cursor-not-allowed opacity-50",
            className
        )}
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
        checkbox: "size-4 rounded border",
    }

    return (
        <input
        ref={ref}
        {...props}
        type={type}
        className={twMerge(styles[type] ?? styles.text, className)}
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
        className={twMerge(
            "w-full rounded border px-3 py-2",
            "focus:outline-none focus:ring-2",
            className
        )}
        />
    )
}

function LabeledInput({
    children, id, type = "text", className, labelClassName, before=true,
    ...props
}: InputHTMLAttributes<HTMLInputElement> & {
    children: ReactNode,
    type?: "text" | "email" | "password" | "number" | "file" | "checkbox",
    before?: boolean,
    labelClassName?: string,
}) {
    return (
    <label 
    className={twMerge("flex items-center gap-2", labelClassName)}
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
        className={twMerge(
            "w-full rounded border px-3 py-2",
            "focus:outline-none focus:ring-2",
            className
        )}
        children={children}
        />
    )
}
