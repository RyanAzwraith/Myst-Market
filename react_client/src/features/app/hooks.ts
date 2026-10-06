import { 
    useFormInputs, 
    kind, 
    type FieldDefs 
} from '@/hooks/FormInputs';


export { usePerformanceForm };

function usePerformanceForm({
    onSubmit
}: { 
    onSubmit?: (values: Record<string, any>) => void 
}) {
    const fields = {
        period: {
            kind: kind.selectOne,
            defaultValue: 30,
            options: {
                7: "Last 7 days",
                30: "Last 30 days",
                90: "Last 90 days",
            },
            labels: {
                7: "Last 7 days",
                30: "Last 30 days",
                90: "Last 90 days",
            }
        }
    } satisfies FieldDefs;

    return useFormInputs({
        fields,
        onSubmit,
    })
}