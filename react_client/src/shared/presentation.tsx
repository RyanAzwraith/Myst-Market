import type { 
    ReactNode, 
    LabelHTMLAttributes 
} from "react"
import type { JSX } from "react"
import { classNames } from "@/utils/classNames"

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
    return (
        <p 
        className={classNames(
            "shared-text",
            `shared-text-${variant}`,
            className
        )}
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
    return (
        <span 
        className={classNames(
            "shared-span",
            `shared-span-${variant}`,
            className
        )}
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
    const Tag = `h${level}` as keyof JSX.IntrinsicElements

    return (
    <Tag className={classNames(
        "shared-heading",
        `shared-heading-level-${level}`,
        className
    )}>
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
        <p className={classNames("shared-error-msg", className)}>
            {errorMsg}
        </p>
    )

const Loading = ({ isError, variant, className }: {
    isError?: boolean,
    variant?: "loading" | "error",
    className?: string
}) => {
    const loadingVariant = variant ?? (isError ? "error" : "loading")
    if (loadingVariant === "error") return (
        <p className={classNames("shared-loading shared-loading-error", className)}>
            Error loading data
        </p>
    )
    return (
        <p className={classNames("shared-loading", className)}>
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
        : <span className={classNames("shared-money-format", className)}>
            $ {amount.toFixed(2)}
        </span>

const SearchTitle = ({ possibleTitles, className }: {
    possibleTitles: (string | null | undefined | false)[]
    className?: string
}) => {
    const title = possibleTitles.find(Boolean)
    return (
        <h1 className={classNames("shared-search-title", className)}>
            {title}
        </h1> 
    )
}

function Divider({ className }: { className?: string }) {
    return <hr className={classNames("shared-divider", className)} />
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
    className={classNames("shared-label", className)}
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
    if (!src) {
        return (
            <div
            role="img"
            aria-label={alt || "Image unavailable"}
            className={classNames(
                "shared-img shared-img-unavailable",
                className
            )}
            >
                Image unavailable
            </div>
        )
    }

    return (
        <img
		className={classNames("shared-img", className)}
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
        className={classNames("shared-vid", className)}
        controls={controls}
        playsInline={playsInline}
        aria-label={ariaLabel}
        {...props}
        />
    )
}