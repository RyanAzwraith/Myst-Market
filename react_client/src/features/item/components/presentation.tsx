
export {
    OnSaleDiv,
}

function OnSaleDiv({
    onSale, children
}: {
    onSale: boolean,
    children: React.ReactNode
}) {
    return (
    <div className={`on-sale ${onSale ? "on-sale-active" : ""}`}>
        {children}
    </div>
    )
}