import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthState } from "./features/user/authState";

import { Catalogue } from "@/features/catalogue/Catalogue";
import { ShopPage } from "@/features/shop/ShopPage";
import { ProductPage } from "@/features/shop/ProductPage";
import { SalePage } from "@/features/shop/SalePage";
import { CheckOut } from "@/features/checkout/CheckOut";
import { RegisterPage } from "@/features/user/RegisterPage";
import { ProfilePage } from "@/features/user/ProfilePage";
import { LoginPage } from "@/features/user/LoginPage";
import { SetPasswordPage } from "@/features/user/SetPasswordPage"


export const AppRoutes = {
	default: "*",
	catalogue: "/catalogue",
	shop: "/shop",
	product: "/product",
	sale: "/sale",
	checkout: "/checkout",
	register: "/register",
	profile: "/profile",
	login: "/login",
	setPassword: "/set-password"
} as const;

export function AppRoutesComponent() {
	const accessToken = useAuthState(state => state.accessToken)
	
	return (
		<Routes>

			<Route path={AppRoutes.default} element={
				<Navigate to={AppRoutes.catalogue} replace />
			} />

			<Route path={AppRoutes.catalogue} element={
				<Catalogue />
			} />

			<Route path={AppRoutes.shop} element={
				<ShopPage />
			} />

			<Route path={AppRoutes.product+'/:slug'} element={
				<ProductPage />
			} />

			<Route path={AppRoutes.sale+'/:slug'} element={
				<SalePage />
			} />

			<Route path={AppRoutes.checkout} element={
				<CheckOut />
			} />

			<Route path={AppRoutes.register} element={
				<ProtectedRoute allowed={!accessToken} redirect={AppRoutes.profile} child={
					<RegisterPage /> 
			}/> }/>

			<Route path={AppRoutes.profile} element={
				<ProtectedRoute allowed={!!accessToken} redirect={AppRoutes.login} child={
				<ProfilePage />
			}/> }/>

			<Route path={AppRoutes.login} element={
				<ProtectedRoute allowed={!accessToken} redirect={AppRoutes.profile} child={
					<LoginPage /> 
			}/> }/>

			<Route path={AppRoutes.setPassword} element={
				<SetPasswordPage />
			} />

		</Routes>
	);
}

export function ProtectedRoute(props: {
    allowed: any
	redirect: string
	child: React.ReactNode
}) {
    if (!props.allowed) 
		return <Navigate replace to={props.redirect} />
    return props.child
}
