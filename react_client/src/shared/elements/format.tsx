    
export {
    MoneyFormat
}

const MoneyFormat = ({amount}: {amount: number}) =>
    <p>$ {amount.toFixed(2)}</p>
