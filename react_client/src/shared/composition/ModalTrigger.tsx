import { 
	type ReactNode, 
	useEffect, 
	useRef, useState 
} from "react";

import {
	Modal
} from '../composition'

export { ModalTrigger };

function ModalTrigger({
	button, render
}: {
	button: ReactNode
	render: (onClose: () => void) => ReactNode
}) {
	const triggerRef = useRef<HTMLButtonElement | null>(null);
	const [open, setOpen] = useState(false);

	const openModal = () => setOpen(true);
	const closeModal = () => setOpen(false);

	useEffect(() => {
		if (!open) {
			triggerRef.current?.focus()
			return
		};

		const handleKeyDown = (event: KeyboardEvent) => 
			event.key === "Escape" && closeModal()
    	
		document.addEventListener("keydown", handleKeyDown)
		return () => document.removeEventListener("keydown", handleKeyDown)
	}, [open]);

	return (
	<>
		<button 
		ref={triggerRef} 
		onClick={openModal}
		children={button}
		/>

		{open && 
		<Modal 
		children={render(closeModal)} 
		/>
		}
	</>
	);
}

