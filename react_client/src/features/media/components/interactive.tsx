
import { useId, useRef, type ChangeEvent } from "react"
import { 
	Button, 
	Input 
} from "@/shared/interactive"


export {
    ImportButton,
    downloadCsv,
}


function ImportButton({
	label,
	isPending,
	onFileSelected,
}: {
	label: string
	isPending: boolean
	onFileSelected: (file: File) => void
}) {
	const inputRef = useRef<HTMLInputElement>(null)
	const inputId = useId()

	function handleChange(event: ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0]
		if (file) onFileSelected(file)
		event.target.value = ""
	}

	return (
	<>
		<Button
		type="button"
		disabled={isPending}
		aria-controls={inputId}
		onClick={() => inputRef.current?.click()}
		>
			{isPending ? "Importing..." : label}
		</Button>
		<Input
		ref={inputRef}
		id={inputId}
		type="file"
		accept=".csv,text/csv"
		className="hidden"
		onChange={handleChange}
		/>
	</>
	)
}

async function downloadCsv(
	exportFile: () => Promise<Blob>,
	fileName: string,
) {
	const blob = await exportFile()
	const url = URL.createObjectURL(blob)
	const link = document.createElement("a")
	link.href = url
	link.download = fileName
	link.click()
	URL.revokeObjectURL(url)
}
