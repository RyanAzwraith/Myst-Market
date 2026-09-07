

export {
    ButtonWrapper
}

const ButtonWrapper = ({onClick, children}: React.PropsWithChildren<{onClick?: () => void}>) =>
    <button
    onClick={onClick}
    className="rounded border border-slate-200 bg-white p-3 shadow-sm"
    >
        {children}
    </button>