/** biome-ignore-all lint/a11y/useButtonType: <explanation> */
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { PageRoutes } from '@/app/PageRoutes'
import { ProfileButton} from "@/features/auth";
import { CategoryBar} from "@/features/product";
import { CartButton } from "@/features/item";

import { useAuthState } from "@/features/user";
import { useSearchParams } from "@/features/product";
import { TextFilterField } from "@/shared/QueryParamsComponent";
import { List } from "@/shared/elements/list";


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
	const {search} = useSearchParams()

	useEffect(() => {
		setShowAdmin(isAdmin ?? false)
	}, [isAdmin])

	if (isAdmin && showAdmin)
		return (
			<div className="app-bar flex items-center 
				justify-between bg-slate-100 px-4 py-3 shadow-sm">
				<button
				className="rounded px-3 py-1 
					text-sm hover:bg-slate-200"
				onClick={() => navigate(PageRoutes.admin)}>
					<h1 className="text-xl font-semibold">Myst Market</h1>
				</button>

			<nav style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
				<List
				items={adminPages}
				renderItem={p => (
					<button
					key={p.path}
					type="button"
					onClick={() => navigate(p.path)}
					>
						{p.label}
					</button>
				)}
				/>
			</nav>

				<AdminModeToggle
					isAdmin={isAdmin}
					showAdmin={showAdmin}
					setShowAdmin={setShowAdmin}
				/>

			</div>
		)

	return (
		<div className="app-bar flex items-center 
			justify-between bg-slate-100 px-4 py-3 shadow-sm">
			<button
			className="rounded px-3 py-1 
				text-sm hover:bg-slate-200"
			onClick={() => navigate(PageRoutes.catalogue)}>
				<h1 className="text-xl font-semibold">Myst Market</h1>
			</button>
			
			<div className='flex flex-col'>
				<TextFilterField 
					accessor={search}
				/>
				<CategoryBar/>
			</div>

			<div className="flex items-center gap-2">
				<AdminModeToggle
				isAdmin={isAdmin}
				showAdmin={showAdmin}
				setShowAdmin={setShowAdmin}
				/>
				<CartButton 
				onCheckoutClick={() => navigate(PageRoutes.checkout)}
				/>
				<ProfileButton 
				onSolidClick={() => navigate(PageRoutes.profile)}
				/>
			</div>
		</div>
	);
}

function AdminModeToggle(
    {
        isAdmin,
        showAdmin,
        setShowAdmin,
    }: {
        isAdmin: boolean,
        showAdmin: boolean,
        setShowAdmin: React.Dispatch<React.SetStateAction<boolean>>
    }
) {
	const navigate = useNavigate();

    if (!isAdmin)
        return null

    return (
        <label className="flex items-center gap-2">
            <input
                type="checkbox"
                checked={showAdmin}
                onChange={(e) => {
					setShowAdmin(e.target.checked)

					if (!e.target.checked) {
						navigate(PageRoutes.catalogue)
					}
				}}
            />
            Admin Mode
        </label>
    )
}