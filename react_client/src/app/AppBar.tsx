/** biome-ignore-all lint/a11y/useButtonType: <explanation> */
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { PageRoutes } from '@/app/PageRoutes'
import { ProfileMenuButton} from "@/features/auth";
import {
	CategoryBar,
	CategoryMenuButton,
} from "@/features/product";
import { CartMenuButton } from "@/features/item";

import { useAuthState } from "@/features/user";
import { useSearchParams } from "@/features/product";
import { SearchField } from "@/hooks/QueryParams";

import { 
	Button, 
	ChevronDownIcon,
	Heading, 
	Inline, 
	LabeledInput, 
	List, 
	ModalTrigger,
	Stack,
} from "@/shared";


const adminPages = [
    { label: 'Dashboard', path: PageRoutes.adminDashboard },
    { label: 'Orders', path: PageRoutes.adminOrders },
    { label: 'Products', path: PageRoutes.adminProducts },
    { label: 'Sales', path: PageRoutes.adminSales },
    { label: 'Users', path: PageRoutes.adminUsers },
];

export function AppBar() {
	const navigate = useNavigate();
	const isAdmin = useAuthState(state => Boolean(state.user?.isAdmin))
	const [showAdmin, setShowAdmin] = useState(false)
	const {bindings: {search}} = useSearchParams()

	useEffect(() => {
		setShowAdmin(isAdmin ?? false)
	}, [isAdmin])

	if (isAdmin && showAdmin)
		return (
		<Inline
		justify="between"
		align="center"
		gap="sm"
		className="app-bar admin-app-bar"
		>
			<Button 
			variant="ghost"
			className="app-bar-logo"
			onClick={() => navigate(PageRoutes.admin)}
			>
				<Heading 
				level={2} 
				className="app-bar-logo-heading"
				>
					Myst Market
				</Heading>
			</Button>

			<Inline
			gap="none"
			align="end"
			className="admin-app-bar-nav"
			>
				<List
				items={adminPages}
				render={p => (
					<Button
					key={p.path}
					type="button"
					variant="ghost"
					className="admin-app-bar-link"
					onClick={() => navigate(p.path)}
					>
						{p.label}
					</Button>
				)}
				/>
			</Inline>

			<Inline gap="sm" align="center" className="app-bar-actions">
				<AdminModeToggle
				isAdmin={isAdmin}
				showAdmin={showAdmin}
				setShowAdmin={setShowAdmin}
				/>
				<AdminNavMenuButton
				navigate={navigate}
				/>
				<CartMenuButton
				onCheckoutClick={() => navigate(PageRoutes.checkout)}
				/>
				<ProfileMenuButton
				onSolidClick={() => navigate(PageRoutes.profile)}
				onOutlineClick={() => {}}
				/>
			</Inline>

		</Inline>
		)

	return (
	<Inline
	justify="between"
	align="center"
	gap="sm"
	className="app-bar"
	>
		<Button 
		variant="ghost"
		className="app-bar-logo"
		onClick={() => navigate(PageRoutes.admin)}
		>
			<Heading 
			level={2} 
			className="app-bar-logo-heading"
			>
				Myst Market
			</Heading>
		</Button>
		
		<Stack gap="sm" align="center" className="app-bar-search">
			<SearchField  
			binding={search} 
			/>
			<CategoryBar/>
		</Stack>

		<Inline gap="sm" align="center" className="app-bar-actions">
			<AdminModeToggle
			isAdmin={isAdmin}
			showAdmin={showAdmin}
			setShowAdmin={setShowAdmin}
			/>
			<CategoryMenuButton />
			<CartMenuButton 
			onCheckoutClick={() => navigate(PageRoutes.checkout)}
			/>
			<ProfileMenuButton 
			onSolidClick={() => navigate(PageRoutes.profile)}
			onOutlineClick={() => {} }
			/>
		</Inline>
	</Inline>
	);
}

function AdminNavMenuButton({
	navigate,
}: {
	navigate: (path: string) => void
}) {
	return (
		<ModalTrigger
		dropdown
		wrapperClassName="app-bar-mobile-nav"
		modalClassName="app-bar-mobile-nav-dialog"
		dialogLabel="Admin navigation"
		button={
			<>
				<span>Menu</span>
				<ChevronDownIcon className="mobile-nav-trigger-icon" />
			</>
		}
		render={onClose => (
			<div className="mobile-nav-menu">
				<List
				items={adminPages}
				render={page => (
					<Button
					key={`mobile-admin-${page.path}`}
					variant="secondary"
					className="mobile-nav-menu-item"
					onClick={() => {
						navigate(page.path)
						onClose()
					}}
					>
						{page.label}
					</Button>
				)}
				/>
			</div>
		)}
		/>
	)
}


function AdminModeToggle({
	isAdmin, showAdmin, setShowAdmin,
}: {
	isAdmin: boolean,
	showAdmin: boolean,
	setShowAdmin: React.Dispatch<React.SetStateAction<boolean>>
} ) {
	const navigate = useNavigate();
    if (!isAdmin) return null
    return (
		<LabeledInput
		before={false}
		type="checkbox"
		labelClassName="admin-mode-toggle"
		checked={showAdmin}
		onChange={(e) => {
			setShowAdmin(e.target.checked)

			if (!e.target.checked) {
				navigate(PageRoutes.catalogue)
			}
		}}>
			Admin Mode
		</LabeledInput>
    )
}