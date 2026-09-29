
export {
    ButtonWrapper
}


const ButtonWrapper = ({onClick, children}: React.PropsWithChildren<{onClick?: () => void}>) =>
    <button
    onClick={onClick}
    >
        {children}
    </button>