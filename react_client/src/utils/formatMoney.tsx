
function formatMoney (cents: number) {
    return `$ ${Math.round(cents/100)}`
}


function calculatePrice (product: ProductDetail) {
    const {data: sales} = useSalesQuery() 
    const sale = product.saleSlug ? sales?.[product.saleSlug] : null
    
    if (!sale) 
        return product.priceAudCent

    return Math.round(
        product.priceAudCent * (100 - sale.discountPercent)
    )
}

export {
    formatMoney
}