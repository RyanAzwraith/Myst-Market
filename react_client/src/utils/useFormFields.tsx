import { useState } from "react";

function useFormFields(fields:{
    name: string
    initial?: string
    validateFunc?: (v:string) => string | null
}[]) {
    const [ initialValues, setInitialValues ] = useState(Object.fromEntries( fields.map((field) => [field.name, field.initial || ""] )))
    const [ values, setValues] = useState(initialValues)
    const [ errorMsg, setErrorMsg ] = useState<string | null>(null)

    const createSetValue = (name:string) => (value:string) => setValues(prev => ({...prev, [name]: value}))
    const setters = Object.fromEntries(fields.map(field => [field.name, createSetValue(field.name)] ))

    const reset = () => {
        setValues(initialValues)
        setErrorMsg(null)
    }

    const syncInitialValues = (newInitials: Record<string, string>) => {
        setInitialValues(newInitials)
        setValues(newInitials)
    }

    const clearFields = (fieldNames: string[]) => {
        const cleared = { ...values }
        fieldNames.forEach(name => cleared[name] = "")
        setValues(cleared)
    }

    const validate = () => {
        for (const field of fields) {
            const validation = field.validateFunc?.(values[field.name]) ?? null
            if (validation) {
                setErrorMsg(validation)
                return false
            }
        }
        setErrorMsg(null)
        return true
    }
    
    return {
        values,
        setters,
        errorMsg,
        setErrorMsg,
        reset,
        syncInitialValues,
        clearFields,
        validate
    };
}

export { useFormFields }

