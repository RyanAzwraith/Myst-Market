import type { 
    ReactNode, 
    LabelHTMLAttributes 
} from "react"
import type { JSX } from "react"

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
    children, variant = "normal"
}: {
    children: ReactNode
    variant?: "normal" | "muted" | "small"
}) {
    const variants = {
        normal: "text-base",
        muted: "text-base text-gray-500",
        small: "text-sm",
    }

    return (
        <p 
        className={variants[variant]}
        children={children}
        />
    )
}

function Span({
    children, variant = "normal"
}: {
    children: ReactNode
    variant?: "normal" | "muted" | "emphasis"
}) {
    const variants = {
        normal: "",
        muted: "text-gray-500",
        emphasis: "font-semibold"
    }

    return (
        <span 
        className={variants[variant]}
        children={children}
        />
    )
}

function Heading({
    children, level = 1
}: {
    children: ReactNode
    level?: 1 | 2 | 3 | 4 | 5 | 6
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
    <Tag className={classNames[level]}>
        {children}
    </Tag>
    )
}



const ErrorMsg = ({ errorMsg }: { errorMsg: string | null }) =>
    !errorMsg ? null : (
        <p className="text-sm text-red-600">{errorMsg}</p>
    )

const Loading = ({ isError }: { 
    isError?: boolean, 
}) => {
    if (isError) return (
        <p className="text-sm text-red-600">Error loading data</p>
    )
    return (
        <p className="text-sm text-slate-600">Loading...</p>
    )
}   

const MoneyFormat = ({amount}: {amount: number | null}) =>
    amount ? <span>$ {amount.toFixed(2)}</span> : "N/A"


const SearchTitle = ({ possibleTitles }: {
    possibleTitles: (string | null | undefined | false)[]
}) => {
    const title = possibleTitles.find(Boolean)
    return (
        <h1 className="mb-2 text-lg font-semibold">
            {title}
        </h1> 
    )
}

function Divider() {
    return <hr className="border-t" />
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
    className={`block text-sm font-medium ${className}`}
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
		className={`max-h-96 max-w-full object-contain ${className}`}
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
        className={`max-h-96 max-w-full object-contain ${className}`}
        controls={controls}
        playsInline={playsInline}
        aria-label={ariaLabel}
        {...props}
        />
    )
}