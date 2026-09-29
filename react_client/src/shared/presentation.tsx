    
export {
    MoneyFormat,
    Title,
    ErrorMsg,
    Loading
}

const ErrorMsg = ({ errorMsg }: { errorMsg: string | null }) =>
    !errorMsg ? null : (
        <p className="text-sm text-red-600">{errorMsg}</p>
    )

const Loading = ({ isError }: { 
    isError?: boolean, 
}) => {
    if (isError) return (
        <p className="text-sm text-red-600">Error loading data</p>
    )
    return (
        <p className="text-sm text-slate-600">Loading...</p>
    )
}   

const MoneyFormat = ({amount}: {amount: number | null}) =>
    amount ? <span>$ {amount.toFixed(2)}</span> : "N/A"


const Title = ({ possibleTitles }: {
    possibleTitles: (string | null | undefined | false)[]
}) => {
    const title = possibleTitles.find(Boolean)
    return (
        <h1 className="mb-2 text-lg font-semibold">
            {title}
        </h1> 
    )
}

