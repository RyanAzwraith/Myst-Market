import { 
    useEffect, 
    useRef, 
    type FormHTMLAttributes, 
    type ReactNode, 
 } from "react"
 import { twMerge } from "tailwind-merge"

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
    <main className={twMerge("min-h-screen", className)}>
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
    className={twMerge(
        "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8",
        className
    )}
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
    const stackClassName = [
        "flex flex-col",
        {
            none: "gap-0",
            sm: "gap-2",
            md: "gap-4",
            lg: "gap-6",
            xl: "gap-8"
        }[gap],
        {
            start: "items-start",
            center: "items-center",
            end: "items-end",
            stretch: "items-stretch"
        }[align]
    ].join(" ")

    return (
    <div className={twMerge(stackClassName, className)}>
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
    const style = [
        "flex",
        wrap && "flex-wrap",
        {
            none: "gap-0",
            sm: "gap-2",
            md: "gap-4",
            lg: "gap-6",
            xl: "gap-8"
        }[gap],
        {
            start: "items-start",
            center: "items-center",
            end: "items-end",
            stretch: "items-stretch"
        }[align],
        {
            start: "justify-start",
            center: "justify-center",
            end: "justify-end",
            between: "justify-between",
            around: "justify-around"
        }[justify]
    ].join(" ")

    return (
        <div className={twMerge(style, className)}>
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
    const columnClasses = {
        1: "grid-cols-1",
        2: "grid-cols-2",
        3: "grid-cols-3",
        4: "grid-cols-4",
        5: "grid-cols-5",
        6: "grid-cols-6"
    }
    const responsiveColumnClasses = {
        sm: {
            1: "sm:grid-cols-1",
            2: "sm:grid-cols-2",
            3: "sm:grid-cols-3",
            4: "sm:grid-cols-4",
            5: "sm:grid-cols-5",
            6: "sm:grid-cols-6"
        },
        md: {
            1: "md:grid-cols-1",
            2: "md:grid-cols-2",
            3: "md:grid-cols-3",
            4: "md:grid-cols-4",
            5: "md:grid-cols-5",
            6: "md:grid-cols-6"
        },
        lg: {
            1: "lg:grid-cols-1",
            2: "lg:grid-cols-2",
            3: "lg:grid-cols-3",
            4: "lg:grid-cols-4",
            5: "lg:grid-cols-5",
            6: "lg:grid-cols-6"
        }
    }

    const gridClassName = [
        "grid",
        columnClasses[columns],
        smColumns && responsiveColumnClasses.sm[smColumns],
        mdColumns && responsiveColumnClasses.md[mdColumns],
        lgColumns && responsiveColumnClasses.lg[lgColumns],
        {
            none: "gap-0",
            sm: "gap-2",
            md: "gap-4",
            lg: "gap-6",
            xl: "gap-8"
        }[gap]
    ].join(" ")

    return (
        <div className={twMerge(gridClassName, className)}>
            {children}
        </div>
    )
}

function Modal({
    children,
    className,
    overlayClassName,
}: {
    children: ReactNode
    className?: string
    overlayClassName?: string
}) {
    const dialogRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        dialogRef.current?.focus()
    }, [])

    return (
    <div className={twMerge(
        "fixed inset-0 flex items-center justify-center bg-black/40",
        overlayClassName
    )}>
        <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        className={twMerge(
            "w-full max-w-lg rounded bg-white p-4",
            className
        )}
        >
            {children}
        </div>
    </div>
    )
}

function Card({ children, onClick, className }: { 
    children: ReactNode,
    className?: string,
    onClick?: () => void,
}) {
    return (
    <article
    className={twMerge(
        "rounded-lg border bg-white p-4 shadow-sm",
        className
    )}
    onClick={onClick}
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
    className={twMerge(
        "flex items-center gap-4 border-b px-4 py-3",
        className
    )}>
        {children}
    </article>
    )
}

function Menu({ children, className }: {
    children: ReactNode
    className?: string
}) {
    return (
    <ul className={twMerge("flex items-center gap-4", className)}>
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
    const spacingClasses = {
        none: "",
        sm: "py-2",
        md: "py-4",
        lg: "py-8"
    }

    return (
        <section className={twMerge(spacingClasses[spacing], className)}>
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
    <form {...props}>
        {children}
    </form>
    )
}

function Legend({ children, className }: {
    children: ReactNode
    className?: string
}) {
    return (
    <legend className={twMerge("text-sm font-semibold", className)}>
        {children}
    </legend>
    )
}

function FieldSet({ children, className }: {
    children: ReactNode
    className?: string
}) {
    return (
    <fieldset className={twMerge("text-sm font-semibold", className)}>
        {children}
    </fieldset>
    )
}
