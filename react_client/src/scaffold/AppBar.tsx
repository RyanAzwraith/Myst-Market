/** biome-ignore-all lint/a11y/useButtonType: <explanation> */
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import {AppRoutes} from '@/AppRoutes.tsx'
import { ProfileButtonComponent } from "../features/user/ProfileButtonComponent";
import { CategoryBarComponent } from "@/features/shop/CategoryBarComponent";
import { CartButtonComponent } from "@/features/cart/CartButtonComponent";

import { AdminAppBarComponent } from "@/features/admin/AppBarAdminComponent";
import { useAuthState } from "@/features/user/authState";
import { useShopParams } from "@/features/shop/shopService";
import { TextFilterField } from "@/shared/QueryParamsComponent";

export function AppBar() {
	const navigate = useNavigate();
	const isAdmin = useAuthState(state => Boolean(state.userModel?.isAdmin))
	const [showAdmin, setShowAdmin] = useState(false)
	const {search} = useShopParams()

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
				onClick={() => navigate(AppRoutes.admin)}>
					<h1 className="text-xl font-semibold">Myst Market</h1>
				</button>

				<AdminAppBarComponent/>

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
			onClick={() => navigate(AppRoutes.catalogue)}>
				<h1 className="text-xl font-semibold">Myst Market</h1>
			</button>
			
			<div className='flex flex-col'>
				<TextFilterField 
					accessor={search}
				/>
				<CategoryBarComponent/>
			</div>

			<div className="flex items-center gap-2">
				<AdminModeToggle
					isAdmin={isAdmin}
					showAdmin={showAdmin}
					setShowAdmin={setShowAdmin}
				/>
				<CartButtonComponent />
				<ProfileButtonComponent />
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
						navigate(AppRoutes.catalogue)
					}
				}}
            />
            Admin Mode
        </label>
    )
}