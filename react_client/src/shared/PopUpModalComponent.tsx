/** biome-ignore-all lint/a11y/useButtonType: <explanation> */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: <explanation> */
/** biome-ignore-all lint/a11y/noNoninteractiveTabindex: <explanation> */
/** biome-ignore-all lint/a11y/noStaticElementInteractions: <explanation> */
import { type ReactNode, useEffect, useRef, useState } from "react";

function PopUpModalComponent(props: {
	children: ReactNode
	content: (onClose: () => void) => ReactNode
}) {
	const triggerRef = useRef<HTMLButtonElement | null>(null);
	const [open, setOpen] = useState(false);

	const openModal = () => setOpen(true);
	const closeModal = () => setOpen(false);

	useEffect(() => {
		if (!open) triggerRef.current?.focus();
	}, [open]);

	return (
		<>
			<button ref={triggerRef} onClick={openModal}>
				{props.children}
			</button>

			{open && <Modal onClose={closeModal}>{props.content(closeModal)}</Modal>}
		</>
	);
}

function Modal(props: { 
    children: ReactNode
    onClose: () => void 
}) {
	const backdropRef = useRef<HTMLDivElement | null>(null);
	const dialogRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		dialogRef.current?.focus();
		const handleKeyDown = (event: KeyboardEvent) => event.key === "Escape" && props.onClose()
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [props.onClose]);

	return (
		<div
        className="fixed inset-0 bg-black/40 flex items-center justify-center"
        ref={backdropRef}
        onClick={props.onClose}
		>
			<div
            className="bg-white rounded p-4 max-w-lg w-full"
            role="dialog"
            aria-modal="true"
            ref={dialogRef}
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
			>
				{props.children}
			</div>
		</div>
	);
}

export { PopUpModalComponent };
