import { 
	type ReactNode, 
	type MouseEvent,
	useEffect, 
	useRef, useState 
} from "react";

import {
	Modal
} from '../composition'
import { twMerge } from "tailwind-merge"

export { ModalTrigger };

function ModalTrigger({
	button,
	render,
	className,
	modalClassName,
	modalOverlayClassName,
	dropdown = false,
	dialogLabel = "Modal",
}: {
	button: ReactNode
	render: (onClose: () => void) => ReactNode
	className?: string
	modalClassName?: string
	modalOverlayClassName?: string
	dropdown?: boolean
	dialogLabel?: string
}) {
	const triggerRef = useRef<HTMLButtonElement | null>(null);
	const wrapperRef = useRef<HTMLDivElement | null>(null);
	const [open, setOpen] = useState(false);

	const openModal = (e: MouseEvent<HTMLButtonElement>) => {
		e.stopPropagation();
		setOpen(true);
	};
	const closeModal = () => {
		setOpen(false);
	};

	useEffect(() => {
		if (!open) {
			triggerRef.current?.focus()
			return
		};
		const handleKeyDown = (event: KeyboardEvent) => 
			event.key === "Escape" && closeModal()

		const handlePointerDown = (event: PointerEvent) => {
			if (
				!(event.target instanceof Node) || triggerRef.current?.contains(event.target) 
			) return
			const dialog = wrapperRef.current?.querySelector('[role="dialog"]',)
			if (!dialog?.contains(event.target)) closeModal()
		}

		document.addEventListener("keydown", handleKeyDown)
		document.addEventListener("pointerdown", handlePointerDown)
		return () => {
			document.removeEventListener("keydown", handleKeyDown)
			document.removeEventListener("pointerdown", handlePointerDown)
		}
	}, [open]);

	return (
	<div
	ref={wrapperRef}
	className={dropdown ? "relative inline-block" : undefined}
	>
		<button 
		ref={triggerRef} 
		onClick={openModal}
		className={className}
		children={button}
		/>

		{open && (
		<Modal 
		className={twMerge(
			dropdown && (
				"w-80 max-w-[calc(100vw-2rem)] rounded-xl border " +
				"border-gray-200 bg-white p-4 shadow-xl"
			),
			modalClassName,
		)}
		overlayClassName={twMerge(
			dropdown && (
				"absolute inset-auto right-0 top-full z-50 mt-2 " +
				"bg-transparent"
			),
			modalOverlayClassName,
		)}
		ariaLabel={dialogLabel}
		children={render(closeModal)} 
		/>
		)}
	</div>
	);
}
