import { 
    useEffect, 
    useRef, 
    type FormHTMLAttributes, 
    type ReactNode, 
 } from "react"
import { ButtonWrapper } from "./interactive"

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

function Page({children}: {
    children: ReactNode
}) {
    return (
    <main className="min-h-screen">
        {children}
    </main >
    )
}

function Container({ children }: {
    children: ReactNode
}) {
    return (
    <div 
    className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"
    >
        {children}
    </div>
    )
}

function Stack({
    children, 
    gap = "md", 
    align = "stretch"
}: {
    children: ReactNode
    gap?: "none" | "sm" | "md" | "lg" | "xl"
    align?: "start" | "center" | "end" | "stretch"
}) {
    const className = [
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
    <div className={className}>
        {children}
    </div>
    )
}

function Inline({
    children, 
    gap = "md", 
    align = "center", 
    justify = "start",
    wrap = false
}: {
    children: ReactNode
    gap?: "none" | "sm" | "md" | "lg" | "xl"
    align?: "start" | "center" | "end" | "stretch"
    justify?: "start" | "center" | "end" | "between" | "around"
    wrap?: boolean
}) {
    const className = [
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
        <div className={className}>
            {children}
        </div>
    )
}

function Grid({
    children,
    columns = 1,
    gap = "md"
}: {
    children: ReactNode
    columns?: 1 | 2 | 3 | 4 | 5 | 6
    gap?: "none" | "sm" | "md" | "lg" | "xl"
}) {
    const className = [
        "grid",
        {
            1: "grid-cols-1",
            2: "grid-cols-2",
            3: "grid-cols-3",
            4: "grid-cols-4",
            5: "grid-cols-5",
            6: "grid-cols-6"
        }[columns],
        {
            none: "gap-0",
            sm: "gap-2",
            md: "gap-4",
            lg: "gap-6",
            xl: "gap-8"
        }[gap]
    ].join(" ")

    return (
        <div className={className}>
            {children}
        </div>
    )
}

function Modal({
    children
}: {
    children: ReactNode
}) {
    const dialogRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        dialogRef.current?.focus()
    }, [])

    return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40">
        <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        className="w-full max-w-lg rounded bg-white p-4"
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
    <ButtonWrapper onClick={onClick}>
    <article
    className={`rounded-lg border bg-white p-4 shadow-sm ${className ?? ""}`}
    onClick={onClick}
    >
            {children}
    </article>
    </ButtonWrapper>
    )
}


function Row({children}: {
    children: React.ReactNode
}) {
    return (
    <article 
    className="flex items-center gap-4 border-b px-4 py-3">
        {children}
    </article>
    )
}

function Menu({ children }: {
    children: ReactNode
}) {
    return (
    <ul className="flex items-center gap-4">
        {children}
    </ul>
    )
}

function Section({
    children,
    spacing = "md"
}: {
    children: ReactNode
    spacing?: "none" | "sm" | "md" | "lg"
}) {
    const spacingClasses = {
        none: "",
        sm: "py-2",
        md: "py-4",
        lg: "py-8"
    }

    return (
        <section className={spacingClasses[spacing]}>
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

function Legend({ children }: {
    children: ReactNode
}) {
    return (
    <legend className="text-sm font-semibold">
        {children}
    </legend>
    )
}

function FieldSet({ children }: {
    children: ReactNode
}) {
    return (
    <fieldset className="text-sm font-semibold">
        {children}
    </fieldset>
    )
}


