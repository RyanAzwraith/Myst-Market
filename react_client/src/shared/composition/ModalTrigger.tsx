import { 
	type ReactNode, 
	type MouseEvent,
	useEffect, 
	useRef, useState 
} from "react";

import {
	Modal
} from '../composition'
import { classNames } from "@/utils/classNames"

export { ModalTrigger };

function ModalTrigger({
	button,
	render,
	className,
	wrapperClassName,
	modalClassName,
	modalOverlayClassName,
	dropdown = false,
	mobileFullScreen = false,
	variant,
	dialogLabel = "Modal",
}: {
	button: ReactNode
	render: (onClose: () => void) => ReactNode
	className?: string
	wrapperClassName?: string
	modalClassName?: string
	modalOverlayClassName?: string
	dropdown?: boolean
	mobileFullScreen?: boolean
	variant?: "default" | "dropdown"
	dialogLabel?: string
}) {
	const triggerRef = useRef<HTMLButtonElement | null>(null);
	const wrapperRef = useRef<HTMLDivElement | null>(null);
	const [open, setOpen] = useState(false);
	const modalVariant = variant ?? (dropdown ? "dropdown" : "default");

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
	className={classNames(
		"shared-modal-trigger",
		wrapperClassName,
		modalVariant === "dropdown" && "shared-modal-trigger-dropdown",
		mobileFullScreen &&
			"shared-modal-trigger-mobile-fullscreen",
	)}
	>
		<button 
		ref={triggerRef} 
		onClick={openModal}
		className={classNames("shared-modal-trigger-button", className)}
		children={button}
		/>

		{open && (
		<Modal 
		className={classNames(
			modalVariant === "dropdown" &&
                "shared-modal-trigger-dropdown-dialog",
			modalClassName,
		)}
		overlayClassName={classNames(
			modalVariant === "dropdown" &&
                "shared-modal-trigger-dropdown-overlay",
			modalOverlayClassName,
		)}
		ariaLabel={dialogLabel}
		children={render(closeModal)} 
		/>
		)}
	</div>
	);
}
