import { type ReactNode } from "react";
import { Loading } from "@/shared";

import { usePerformanceForm } from "../hooks";
import { usePerformanceQuery } from '../service';
import type { Performance } from '../schema';


export {
    PerformanceLoader,
}

function PerformanceLoader({render}: { 
    render: ({
        form, data
    }: { 
        form: ReturnType<typeof usePerformanceForm>, 
        data: Performance 
    }) => ReactNode 
}) {
    const form = usePerformanceForm({});
	const { data } = usePerformanceQuery(form.values);
	if (!data) return <Loading />
	return render({ form, data })
}