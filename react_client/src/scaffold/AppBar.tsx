/** biome-ignore-all lint/a11y/useButtonType: <explanation> */
import { useNavigate } from "react-router-dom";

import {AppRoutes} from '@/AppRoutes.tsx'
import { ProfileButtonComponent } from "../features/user/ProfileButtonComponent";
import { CategoryBarComponent } from "@/features/shop/CategoryBarComponent";
import { SearchBarComponent } from "@/features/shop/SearchBarComponent";
import { CartButtonComponent } from "@/features/cart/cartButtonComponent";

export function AppBar() {
	const navigate = useNavigate();
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
				<SearchBarComponent />
				<CategoryBarComponent/>
			</div>

			<div className="flex items-center gap-2">
				<CartButtonComponent />
				<ProfileButtonComponent />
			</div>
		</div>
	);
}
