import { 
    useEffect, 
    useRef, 
    type FormHTMLAttributes, 
    type ReactNode, 
 } from "react"
 import { classNames } from "@/utils/classNames"

export {
    List,
    Page,
    Container,
    Stack,
    Inline ,
    Grid,
    Modal,
    Card,
    Row,
    Menu,
    Section,
    Form,
    Legend,
    FieldSet,
}

function List<T>({
    items, render
}: {
    items: T[],
    render: (item: T, index: number) => ReactNode
}) {
    return (
    <>
        {items.map((item, index) => render(item, index))}
    </>
    )
}

function Page({children, className}: {
    children: ReactNode
    className?: string
}) {
    return (
    <main className={classNames("shared-page", className)}>
        {children}
    </main >
    )
}

function Container({ children, className }: {
    children: ReactNode
    className?: string
}) {
    return (
    <div 
    className={classNames("shared-container", className)}
    >
        {children}
    </div>
    )
}

function Stack({
    children, 
    gap = "md", 
    align = "stretch",
    className,
}: {
    children: ReactNode
    gap?: "none" | "sm" | "md" | "lg" | "xl"
    align?: "start" | "center" | "end" | "stretch"
    className?: string
}) {
    const stackClassName = classNames(
        "shared-stack",
        `shared-stack-gap-${gap}`,
        `shared-stack-align-${align}`,
    )

    return (
    <div className={classNames(stackClassName, className)}>
        {children}
    </div>
    )
}

function Inline({
    children, 
    gap = "md", 
    align = "center", 
    justify = "start",
    wrap = false,
    className,
}: {
    children: ReactNode
    gap?: "none" | "sm" | "md" | "lg" | "xl"
    align?: "start" | "center" | "end" | "stretch"
    justify?: "start" | "center" | "end" | "between" | "around"
    wrap?: boolean
    className?: string
}) {
    const style = classNames(
        "shared-inline",
        `shared-inline-gap-${gap}`,
        `shared-inline-align-${align}`,
        `shared-inline-justify-${justify}`,
        wrap && "shared-inline-wrap",
    )

    return (
        <div className={classNames(style, className)}>
            {children}
        </div>
    )
}

function Grid({
    children,
    columns = 1,
    gap = "md",
    className,
    smColumns,
    mdColumns,
    lgColumns,
}: {
    children: ReactNode
    columns?: 1 | 2 | 3 | 4 | 5 | 6
    gap?: "none" | "sm" | "md" | "lg" | "xl"
    className?: string
    smColumns?: 1 | 2 | 3 | 4 | 5 | 6
    mdColumns?: 1 | 2 | 3 | 4 | 5 | 6
    lgColumns?: 1 | 2 | 3 | 4 | 5 | 6
}) {
    const gridClassName = classNames(
        "shared-grid",
        `shared-grid-columns-${columns}`,
        smColumns && `shared-grid-sm-columns-${smColumns}`,
        mdColumns && `shared-grid-md-columns-${mdColumns}`,
        lgColumns && `shared-grid-lg-columns-${lgColumns}`,
        `shared-grid-gap-${gap}`,
    )

    return (
        <div className={classNames(gridClassName, className)}>
            {children}
        </div>
    )
}

function Modal({
    children,
    className,
    overlayClassName,
    ariaLabel = "Modal",
}: {
    children: ReactNode
    className?: string
    overlayClassName?: string
    ariaLabel?: string
}) {
    const dialogRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        dialogRef.current?.focus()
    }, [])

    return (
    <div className={classNames("shared-modal", overlayClassName)}>
        <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        tabIndex={-1}
        className={classNames("shared-modal-dialog", className)}
        >
            {children}
        </div>
    </div>
    )
}

function Card({
    children,
    onClick,
    className,
    variant = "default",
    ariaLabel,
}: { 
    children: ReactNode,
    className?: string,
    onClick?: () => void,
    variant?: "default" | "compact",
    ariaLabel?: string,
}) {
    const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
        if (
            !onClick ||
            event.target !== event.currentTarget ||
            !["Enter", " "].includes(event.key)
        ) return

        event.preventDefault()
        onClick()
    }

    return (
    <article
    className={classNames(
        "shared-card",
        `shared-card-${variant}`,
        onClick && "shared-card-interactive",
        className
    )}
    role={onClick ? "button" : undefined}
    tabIndex={onClick ? 0 : undefined}
    aria-label={ariaLabel}
    onClick={onClick}
    onKeyDown={handleKeyDown}
    >
        {children}
    </article>
    )
}


function Row({
    children, className
}: {
    children: React.ReactNode
    className?: string
}) {
    return (
    <article 
    className={classNames("shared-row", className)}>
        {children}
    </article>
    )
}

function Menu({ children, className }: {
    children: ReactNode
    className?: string
}) {
    return (
    <ul className={classNames("shared-menu", className)}>
        {children}
    </ul>
    )
}

function Section({
    children,
    spacing = "md",
    className,
}: {
    children: ReactNode
    spacing?: "none" | "sm" | "md" | "lg"
    className?: string
}) {
    return (
        <section className={classNames(
            "shared-section",
            `shared-section-spacing-${spacing}`,
            className
        )}>
            {children}
        </section>
    )
}

function Form({
    children,
    ...props
}: FormHTMLAttributes<HTMLFormElement> & {
    children: ReactNode
} ) {
    return (
    <form {...props} className={classNames("shared-form", props.className)}>
        {children}
    </form>
    )
}

function Legend({ children, className }: {
    children: ReactNode
    className?: string
}) {
    return (
    <legend className={classNames("shared-legend", className)}>
        {children}
    </legend>
    )
}

function FieldSet({ children, className }: {
    children: ReactNode
    className?: string
}) {
    return (
    <fieldset className={classNames("shared-field-set", className)}>
        {children}
    </fieldset>
    )
}
