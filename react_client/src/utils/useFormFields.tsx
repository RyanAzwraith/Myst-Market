import { useState } from "react";

function useFormFields(fields:{
    name: string
    initial?: string
    validateFunc?: (v:string) => string | null
}[]) {
    const initialValues = Object.fromEntries( fields.map((field) => [field.name, field.initial || ""] ))
    const [ values, setValues] = useState(initialValues)
    const [ errorMsg, setErrorMsg ] = useState<string | null>(null)

    const createSetValue = (name:string) => (value:string) => setValues(prev => ({...prev, [name]: value}))
    const setters = Object.fromEntries(fields.map(field => [field.name, createSetValue(field.name)] ))

    const reset = () => {
        setValues(initialValues)
        setErrorMsg(null)
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
        validate
    };
}

export { useFormFields }

