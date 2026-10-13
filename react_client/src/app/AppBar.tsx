/** biome-ignore-all lint/a11y/useButtonType: <explanation> */
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { PageRoutes } from '@/app/PageRoutes'
import { ProfileMenuButton} from "@/features/auth";
import { CategoryBar} from "@/features/product";
import { CartMenuButton } from "@/features/item";

import { useAuthState } from "@/features/user";
import { useSearchParams } from "@/features/product";
import { SearchField } from "@/hooks/QueryParams";

import { 
	Button, 
	Heading, 
	Inline, 
	LabeledInput, 
	List, 
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
		className="bg-slate-800 px-4 pr-16 pt-4 shadow-sm text-slate-50 pt-4"
		>
			<Button 
			variant="ghost"
			className="shrink-0 px-2"
			onClick={() => navigate(PageRoutes.admin)}
			>
				<Heading 
				level={2} 
				className="font-semibold"
				>
					Myst Market
				</Heading>
			</Button>

			<Inline
			gap="none"
			align="end"
			className="min-w-0 pt-4"
			>
				<List
				items={adminPages}
				render={p => (
					<Button
					key={p.path}
					type="button"
					variant="ghost"
					className="bg-slate-400 text-slate-900 border border-black 
                		rounded-t-md border-b-0 rounded-b-none"  
					onClick={() => navigate(p.path)}
					>
						{p.label}
					</Button>
				)}
				/>
			</Inline>

			<Inline gap="sm" align="center" className="shrink-0">
				<AdminModeToggle
				isAdmin={isAdmin}
				showAdmin={showAdmin}
				setShowAdmin={setShowAdmin}
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
	className="bg-slate-800 px-4 pr-16 pt-2 shadow-sm text-slate-50"
	>
		<Button 
		variant="ghost"
		className="px-2"
		onClick={() => navigate(PageRoutes.admin)}
		>
			<Heading 
			level={2} 
			className="font-semibold"
			>
				Myst Market
			</Heading>
		</Button>
		
		<Stack gap="sm" align="center" className="min-w-0 p-0">
			<SearchField  
			binding={search} 
			/>
			<CategoryBar/>
		</Stack>

		<Inline gap="sm" align="center" className="shrink-0">
			<AdminModeToggle
			isAdmin={isAdmin}
			showAdmin={showAdmin}
			setShowAdmin={setShowAdmin}
			/>
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