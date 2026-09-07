import {
    ChevronDownIcon as HeroChevronDownIcon,
    XMarkIcon as HeroXMarkIcon,
    MinusIcon as HeroMinusIcon,
    PlusIcon as HeroPlusIcon,
    UserCircleIcon as HeroUserCircleSolidIcon,
    ShoppingCartIcon as HeroShoppingCartSolidIcon ,
} from "@heroicons/react/24/solid"
import {
    UserCircleIcon as HeroUserCircleOutlineIcon,
    ShoppingCartIcon as HeroShoppingCartOutlineIcon,
} from "@heroicons/react/24/outline"


export {
    ChevronDownIcon,
    XMarkIcon,
    UserCircleSolidIcon,
    UserCircleOutlineIcon,
    ShoppingCartOutlineIcon,
    ShoppingCartSolidIcon,
    MinusIcon,
    PlusIcon,
}


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