import {
    ChevronDownIcon as HeroChevronDownIcon,
    ChevronUpIcon as HeroChevronUpIcon,
    ChevronRightIcon as HeroChevronRightIcon,
    ChevronLeftIcon as HeroChevronLeftIcon,
    XMarkIcon as HeroXMarkIcon,
    MinusIcon as HeroMinusIcon,
    PlusIcon as HeroPlusIcon,
    UserCircleIcon as HeroUserCircleSolidIcon,
    ShoppingCartIcon as HeroShoppingCartSolidIcon ,
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


const ChevronUpIcon = ({ onClick, hidden }: {
    onClick?: () => void,
    hidden?: boolean
}) => 
    hidden ? null : 
    !onClick ?
    <HeroChevronUpIcon 
    aria-label="ChevronUpIcon"
    className="h-24 w-24" 
    /> :
    <button onClick={onClick}>
        <HeroChevronUpIcon 
        aria-label="ChevronUpIcon"
        className="h-24 w-24" 
        />
    </button>

const ChevronDownIcon = ({ onClick, hidden }: {
    onClick?: () => void,
    hidden?: boolean
}) => 
    hidden ? null : 
    !onClick ?
    <HeroChevronDownIcon 
    aria-label="ChevronDownIcon"
    className="h-24 w-24" 
    /> :
    <button onClick={onClick}>
        <HeroChevronDownIcon 
        aria-label="ChevronDownIcon"
        className="h-24 w-24" 
        />
    </button>

const ChevronRightIcon = ({ onClick, hidden }: {
    onClick?: () => void,
    hidden?: boolean
}) => 
    hidden ? null : 
    !onClick ?
    <HeroChevronRightIcon 
    aria-label="ChevronRightIcon"
    className="h-24 w-24" 
    /> :
    <button onClick={onClick}>
        <HeroChevronRightIcon 
        aria-label="ChevronRightIcon"
        className="h-24 w-24" 
        />
    </button>

const ChevronLeftIcon = ({ onClick, hidden }: {
    onClick?: () => void,
    hidden?: boolean
}) => 
    hidden ? null : 
    !onClick ?
    <HeroChevronLeftIcon 
    aria-label="ChevronLeftIcon"
    className="h-24 w-24" 
    /> :
    <button onClick={onClick}>
        <HeroChevronLeftIcon 
        aria-label="ChevronLeftIcon"
        className="h-24 w-24" 
        />
    </button>

const XMarkIcon = ({ onClick, hidden }: {
    onClick?: () => void,
    hidden?: boolean
}) => 
    hidden ? null : 
    !onClick ?
    <HeroXMarkIcon 
    aria-label="XMarkIcon"
    className="h-24 w-24" 
    /> :
    <button onClick={onClick}>
        <HeroXMarkIcon 
        aria-label="XMarkIcon"
        className="h-24 w-24" 
        />
    </button>

const UserCircleSolidIcon = ({ onClick, hidden }: {
    onClick?: () => void,
    hidden?: boolean
}) => 
    hidden ? null : 
    !onClick ?
    <HeroUserCircleSolidIcon 
    aria-label="UserCircleSolidIcon"
    className="h-24 w-24" 
    /> :
    <button onClick={onClick}>
        <HeroUserCircleSolidIcon 
        aria-label="UserCircleSolidIcon"
        className="h-24 w-24" 
        />
    </button>

const UserCircleOutlineIcon = ({ onClick, hidden }: {
    onClick?: () => void,
    hidden?: boolean
}) => 
    hidden ? null : 
    !onClick ?
    <HeroUserCircleOutlineIcon 
    aria-label="UserCircleOutlineIcon"
    className="h-24 w-24" 
    /> :
    <button onClick={onClick}>
        <HeroUserCircleOutlineIcon 
        aria-label="UserCircleOutlineIcon"
        className="h-24 w-24" 
        />
    </button>

const ShoppingCartOutlineIcon = ({ onClick, hidden }: {
    onClick?: () => void,
    hidden?: boolean
}) => 
    hidden ? null : 
    !onClick ?
    <HeroShoppingCartOutlineIcon 
    aria-label="ShoppingCartOutlineIcon"
    className="h-24 w-24" 
    /> :
    <button onClick={onClick}>
        <HeroShoppingCartOutlineIcon 
        aria-label="ShoppingCartOutlineIcon"
        className="h-24 w-24" 
        />
    </button>

const ShoppingCartSolidIcon = ({ onClick, hidden }: {
    onClick?: () => void,
    hidden?: boolean
}) => 
    hidden ? null : 
    !onClick ?
    <HeroShoppingCartSolidIcon 
    aria-label="ShoppingCartSolidIcon"
    className="h-24 w-24" 
    /> :
    <button onClick={onClick}>
        <HeroShoppingCartSolidIcon 
        aria-label="ShoppingCartSolidIcon"
        className="h-24 w-24" 
        />
    </button>

const MinusIcon = ({ onClick, hidden }: {
    onClick?: () => void,
    hidden?: boolean
}) => 
    hidden ? null : 
    !onClick ?
    <HeroMinusIcon 
    aria-label="MinusIcon"
    className="h-24 w-24" 
    /> :
    <button onClick={onClick}>
        <HeroMinusIcon 
        aria-label="MinusIcon"
        className="h-24 w-24" 
        />
    </button>

const PlusIcon = ({ onClick, hidden }: {
    onClick?: () => void,
    hidden?: boolean
}) => 
    hidden ? null : 
    !onClick ?
    <HeroPlusIcon 
    aria-label="PlusIcon"
    className="h-24 w-24" 
    /> :
    <button onClick={onClick}>
        <HeroPlusIcon 
        aria-label="PlusIcon"
        className="h-24 w-24" 
        />
    </button>

const StarSolidIcon = ({ onClick, hidden }: {
    onClick?: () => void,
    hidden?: boolean
}) => 
    hidden ? null : 
    !onClick ?
    <HeroStarSolidIcon 
    aria-label="StarSolidIcon"
    className="h-24 w-24" 
    /> :
    <button onClick={onClick}>
        <HeroStarSolidIcon 
        aria-label="StarSolidIcon"
        className="h-24 w-24" 
        />
    </button>

const StarOutlineIcon = ({ onClick, hidden }: {
    onClick?: () => void,
    hidden?: boolean
}) => 
    hidden ? null : 
    !onClick ?
    <HeroStarOutlineIcon 
    aria-label="StarOutlineIcon"
    className="h-24 w-24" 
    /> :
    <button onClick={onClick}>
        <HeroStarOutlineIcon 
        aria-label="StarOutlineIcon"
        className="h-24 w-24" 
        />
    </button>

const ExclamationTriangleIcon = ({ onClick, hidden }: {
    onClick?: () => void,
    hidden?: boolean
}) => 
    hidden ? null : 
    !onClick ?
    <HeroExclamationTriangleIcon 
    aria-label="ExclamationTriangleIcon"
    className="h-24 w-24" 
    /> :
    <button onClick={onClick}>
        <HeroExclamationTriangleIcon 
        aria-label="ExclamationTriangleIcon"
        className="h-24 w-24" 
        />
    </button>

const ArrowDownIcon = ({ onClick, hidden }: {
    onClick?: () => void,
    hidden?: boolean
}) => 
    hidden ? null : 
    !onClick ?
    <HeroArrowDownIcon 
    aria-label="ArrowDownIcon"
    className="h-24 w-24" 
    /> :
    <button onClick={onClick}>
        <HeroArrowDownIcon 
        aria-label="ArrowDownIcon"
        className="h-24 w-24" 
        />
    </button>

const ArrowUpIcon = ({ onClick, hidden }: {
    onClick?: () => void,
    hidden?: boolean
}) => 
    hidden ? null : 
    !onClick ?
    <HeroArrowUpIcon 
    aria-label="ArrowUpIcon"
    className="h-24 w-24" 
    /> :
    <button onClick={onClick}>
        <HeroArrowUpIcon 
        aria-label="ArrowUpIcon"
        className="h-24 w-24" 
        />
    </button>