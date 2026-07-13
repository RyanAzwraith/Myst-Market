


function formatMoney (cents: number) {
    return `$ ${Math.round(cents/100)}`
}

export {formatMoney}