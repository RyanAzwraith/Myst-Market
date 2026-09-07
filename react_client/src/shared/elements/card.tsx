import { ButtonWrapper } from "./button"

export {
    SmallCard,
    Card,
    Row
}

const SmallCard = (_: React.PropsWithChildren<{}>) =>
    <div 
    className="ProductLinkedImage border border-slate-200 bg-white p-3 shadow-sm"
    />

const Card = ({onClick, children}: React.PropsWithChildren<{onClick?: () => void}>) =>
    onClick ?
    <ButtonWrapper onClick={onClick}>
        <div>{children}</div>
    </ButtonWrapper> 
    : 
    <div>{children}</div>

const Row = ({onClick, children}: React.PropsWithChildren<{onClick?: () => void}>) =>
    onClick ?
    <ButtonWrapper onClick={onClick}>
        <div>{children}</div>
    </ButtonWrapper> 
    : 
    <div>{children}</div>