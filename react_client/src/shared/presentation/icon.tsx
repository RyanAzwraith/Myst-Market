import {
    ChevronDownIcon as HeroChevronDownIcon,
    ChevronUpIcon as HeroChevronUpIcon,
    ChevronRightIcon as HeroChevronRightIcon,
    ChevronLeftIcon as HeroChevronLeftIcon,
    XMarkIcon as HeroXMarkIcon,
    MinusIcon as HeroMinusIcon,
    PlusIcon as HeroPlusIcon,
    UserCircleIcon as HeroUserCircleSolidIcon,
    ShoppingCartIcon as HeroShoppingCartSolidIcon,
    StarIcon as HeroStarSolidIcon,
    ArrowDownIcon as HeroArrowDownIcon,
    ArrowUpIcon as HeroArrowUpIcon,
} from "@heroicons/react/24/solid"
import {
    UserCircleIcon as HeroUserCircleOutlineIcon,
    ShoppingCartIcon as HeroShoppingCartOutlineIcon,
    StarIcon as HeroStarOutlineIcon,
    ExclamationTriangleIcon as HeroExclamationTriangleIcon,
} from "@heroicons/react/24/outline"
import type { ComponentType, SVGProps } from "react"
import { twMerge } from "tailwind-merge"

export {
    ChevronDownIcon,
    ChevronUpIcon,
    ChevronRightIcon,
    ChevronLeftIcon,
    XMarkIcon,
    UserCircleSolidIcon,
    UserCircleOutlineIcon,
    ShoppingCartOutlineIcon,
    ShoppingCartSolidIcon,
    MinusIcon,
    PlusIcon,
    StarSolidIcon,
    StarOutlineIcon,
    ExclamationTriangleIcon,
    ArrowDownIcon,
    ArrowUpIcon,
}

type IconProps = {
    onClick?: () => void
    hidden?: boolean
    className?: string
    buttonClassName?: string
    ariaLabel?: string
}

function createIcon(
    Icon: ComponentType<SVGProps<SVGSVGElement>>,
    name: string,
) {
    return function IconComponent({
        onClick,
        hidden,
        className,
        buttonClassName,
        ariaLabel,
    }: IconProps) {
        if (hidden) return null

        const icon = (
            <Icon
                aria-label={ariaLabel ?? name}
                className={twMerge("h-8 w-8", className)}
            />
        )

        if (!onClick) return icon

        return (
            <button
                type="button"
                aria-label={ariaLabel ?? name}
                onClick={onClick}
                className={buttonClassName}
            >
                {icon}
            </button>
        )
    }
}

const ChevronUpIcon = createIcon(HeroChevronUpIcon, "ChevronUpIcon")
const ChevronDownIcon = createIcon(HeroChevronDownIcon, "ChevronDownIcon")
const ChevronRightIcon = createIcon(
    HeroChevronRightIcon,
    "ChevronRightIcon",
)
const ChevronLeftIcon = createIcon(HeroChevronLeftIcon, "ChevronLeftIcon")
const XMarkIcon = createIcon(HeroXMarkIcon, "XMarkIcon")
const UserCircleSolidIcon = createIcon(
    HeroUserCircleSolidIcon,
    "UserCircleSolidIcon",
)
const UserCircleOutlineIcon = createIcon(
    HeroUserCircleOutlineIcon,
    "UserCircleOutlineIcon",
)
const ShoppingCartOutlineIcon = createIcon(
    HeroShoppingCartOutlineIcon,
    "ShoppingCartOutlineIcon",
)
const ShoppingCartSolidIcon = createIcon(
    HeroShoppingCartSolidIcon,
    "ShoppingCartSolidIcon",
)
const MinusIcon = createIcon(HeroMinusIcon, "MinusIcon")
const PlusIcon = createIcon(HeroPlusIcon, "PlusIcon")
const StarSolidIcon = createIcon(HeroStarSolidIcon, "StarSolidIcon")
const StarOutlineIcon = createIcon(HeroStarOutlineIcon, "StarOutlineIcon")
const ExclamationTriangleIcon = createIcon(
    HeroExclamationTriangleIcon,
    "ExclamationTriangleIcon",
)
const ArrowDownIcon = createIcon(HeroArrowDownIcon, "ArrowDownIcon")
const ArrowUpIcon = createIcon(HeroArrowUpIcon, "ArrowUpIcon")
