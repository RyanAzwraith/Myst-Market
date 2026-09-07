
export { 
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