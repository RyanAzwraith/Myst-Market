/** biome-ignore-all lint/a11y/useButtonType: <explanation> */
import { useNavigate } from "react-router-dom";
import { Cart } from "../features/cart/CartComponent";
import { ProfileButtonComponent } from "../features/user/ProfileButton";
import { useAuthState } from "@/features/user/authState";
import {AppRoutes} from '@/AppRoutes.tsx'

export function AppBar() {
	const navigate = useNavigate();
	const authState = useAuthState();
	return (
		<div className="app-bar flex items-center justify-between bg-slate-300 px-4 py-3">
			<h1 className="text-xl font-semibold">Myst Market</h1>
			<span>- {authState.userModel?.name} - {authState.accessToken} -</span>
				

			<div className="flex items-center gap-2">
				<button
					className="rounded bg-slate-800 px-3 py-1 text-sm text-white hover:bg-slate-900"
					onClick={() => navigate(AppRoutes.catalogue)}
				>
					Catalogue
				</button>
				<button
					className="rounded bg-slate-800 px-3 py-1 text-sm text-white hover:bg-slate-900"
					onClick={() => navigate("/shop")}
				>
					Shopping
				</button>
				<ProfileButtonComponent />
			</div>
		</div>
	);
}
