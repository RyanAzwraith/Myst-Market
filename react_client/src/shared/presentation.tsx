import type { 
    ReactNode, 
    LabelHTMLAttributes 
} from "react"
import type { JSX } from "react"
import { twMerge } from "tailwind-merge"

export {
    Text,
    Span,
    Heading,
    MoneyFormat,
    SearchTitle,
    ErrorMsg,
    Loading,
    Divider,
    Label,
    Img,
    Vid,
}


function Text({
    children, variant = "normal", className
}: {
    children: ReactNode
    variant?: "normal" | "muted" | "small"
    className?: string
}) {
    const variants = {
        normal: "text-base",
        muted: "text-base text-gray-500",
        small: "text-sm",
    }

    return (
        <p 
        className={twMerge(variants[variant], className)}
        children={children}
        />
    )
}

function Span({
    children, variant = "normal", className
}: {
    children: ReactNode
    variant?: "normal" | "muted" | "emphasis"
    className?: string
}) {
    const variants = {
        normal: "",
        muted: "text-gray-500",
        emphasis: "font-semibold"
    }

    return (
        <span 
        className={twMerge(variants[variant], className)}
        children={children}
        />
    )
}

function Heading({
    children, level = 1, className,
}: {
    children: ReactNode
    level?: 1 | 2 | 3 | 4 | 5 | 6
    className?: string
}) {
    const classNames = {
        1: "text-2xl font-bold",
        2: "text-xl font-bold",
        3: "text-lg font-semibold",
        4: "text-base font-semibold",
        5: "text-sm font-semibold",
        6: "text-xs font-semibold"
    }

    const Tag = `h${level}` as keyof JSX.IntrinsicElements

    return (
    <Tag className={twMerge(classNames[level], className)}>
        {children}
    </Tag>
    )
}



const ErrorMsg = ({
    errorMsg, className
}: {
    errorMsg: string | null
    className?: string
}) =>
    !errorMsg ? null : (
        <p className={twMerge("text-sm text-red-600", className)}>
            {errorMsg}
        </p>
    )

const Loading = ({ isError, className }: { 
    isError?: boolean, 
    className?: string
}) => {
    if (isError) return (
        <p className={twMerge("text-sm text-red-600", className)}>
            Error loading data
        </p>
    )
    return (
        <p className={twMerge("text-sm text-slate-600", className)}>
            Loading...
        </p>
    )
}   

const MoneyFormat = ({
    amount, className
}: {
    amount: number | null
    className?: string
}) =>
    amount === null
        ? "N/A"
        : <span className={className}>$ {amount.toFixed(2)}</span>

const SearchTitle = ({ possibleTitles, className }: {
    possibleTitles: (string | null | undefined | false)[]
    className?: string
}) => {
    const title = possibleTitles.find(Boolean)
    return (
        <h1 className={twMerge("mb-2 text-lg font-semibold", className)}>
            {title}
        </h1> 
    )
}

function Divider({ className }: { className?: string }) {
    return <hr className={twMerge("border-t", className)} />
}

function Label({
    children,
    className,
    ...props
}: LabelHTMLAttributes<HTMLLabelElement> & {
    children: ReactNode
}) {
    return (
    <label
    {...props}
    className={twMerge("block text-sm font-medium", className)}
    >
            {children}
    </label>
    )
}

function Img({
    src,
    alt,
    className,
    ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
		className={twMerge(
            "max-h-96 max-w-full object-contain",
            className
        )}
        src={src}
        alt={alt}
        {...props}
        />
    )
}

function Vid({
    src,
    className,
    controls = true,
    playsInline = true,
    ariaLabel,
    ...props
}: React.VideoHTMLAttributes<HTMLVideoElement> & {
    ariaLabel?: string
}) {
    return (
        <video
        src={src}
        className={twMerge(
            "max-h-96 max-w-full object-contain",
            className
        )}
        controls={controls}
        playsInline={playsInline}
        aria-label={ariaLabel}
        {...props}
        />
    )
}