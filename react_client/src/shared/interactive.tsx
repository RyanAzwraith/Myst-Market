import type { 
    ReactNode, 
    InputHTMLAttributes,
    Ref,
    TextareaHTMLAttributes,
    SelectHTMLAttributes,
    MouseEvent,
} from "react"
import { classNames } from "@/utils/classNames"

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
        className={classNames("shared-button-wrapper", className)}
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
    onClick,
}: {
    className?: string
    children: ReactNode
    type?: "button" | "submit" | "reset"
    variant?: "primary" | "secondary" | "danger" | "ghost"
    disabled?: boolean
    onClick?: (event: MouseEvent<HTMLButtonElement>) => void
}) {
    return (
        <button
        type={type}
        disabled={disabled}
        onClick={onClick}
        className={classNames(
            "shared-button",
            `shared-button-${variant}`,
            disabled && "shared-button-disabled",
            className
        )}
        >
            {children}
        </button>
    )
}

function Input({
    type = "text",
    variant,
    className,
    ref,
    ...props
}: InputHTMLAttributes<HTMLInputElement> & {
    type?: "text" | "email" | "password" | "number" | "file" | "checkbox"
    variant?: "default" | "checkbox"
    ref?: Ref<HTMLInputElement>
}) {
    const inputVariant = variant ?? (
        type === "checkbox" ? "checkbox" : "default"
    )

    return (
        <input
        ref={ref}
        {...props}
        type={type}
        className={classNames(
            "shared-input",
            `shared-input-${inputVariant}`,
            className
        )}
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
        className={classNames("shared-text-area", className)}
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
    className={classNames("shared-labeled-input", labelClassName)}
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
        className={classNames("shared-select", className)}
        children={children}
        />
    )
}
