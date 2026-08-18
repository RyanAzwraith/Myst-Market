import { Routes, Route, Navigate } from "react-router-dom"
import { useAuthState } from "./features/user/authState"

import { CataloguePage } from "@/features/catalogue/CataloguePage"
import { ShopPage } from "@/features/shop/ShopPage"
import { ProductPage } from "@/features/shop/ProductPage"
import { SalePage } from "@/features/shop/SalePage"
import { CheckOutPage } from "@/features/checkout/CheckOutPage"
import { RegisterPage } from "@/features/user/RegisterPage"
import { ProfilePage } from "@/features/user/ProfilePage"
import { OrderPage } from "@/features/checkout/OrderPage"
import { LoginPage } from "@/features/user/LoginPage"
import { SetPasswordPage } from "@/features/user/SetPasswordPage"
import { SuccessPage } from "./features/checkout/SuccessPage"
import {DashboardPage} from "./features/admin/DashboardPage"
import {OrdersPage} from "./features/admin/OrdersPage"
import {ProductsPage} from "./features/admin/ProductsPage"
import {SalesPage} from "./features/admin/SalesPage"
import {UsersPage} from "./features/admin/UsersPage"


const AppRoutes = {
	default: "*",
	catalogue: "/catalogue",
	shop: "/shop",
	product: "/product",
	sale: "/sale",
	checkout: "/checkout",
	register: "/register",
	profile: "/profile",
	order: "/order",
	login: "/login",
	setPassword: "/set-password",
	success: "/success",
	admin: "/admin",
	adminDashboard: "/admin/dashboard",
	adminOrders: "/admin/orders",
	adminProducts: "/admin/products",
	adminSales: "/admin/sales",
	adminUsers: "/admin/users",

} as const;

function AppRoutesComponent() {
	const accessToken = useAuthState(state => state.accessToken)
	const isAdmin = useAuthState(state => state.userModel?.isAdmin)
	
	return (
		<Routes>

			<Route path={AppRoutes.default} element={
				<Navigate to={AppRoutes.catalogue} replace />
			} />

			<Route path={AppRoutes.catalogue} element={
				<CataloguePage />
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
				<CheckOutPage />
			} />

			<Route path={AppRoutes.register} element={
				<ProtectedRoute allowed={!accessToken} redirect={AppRoutes.profile} child={
					<RegisterPage /> 
			}/> }/>

			<Route path={AppRoutes.profile} element={
				<ProtectedRoute allowed={!!accessToken} redirect={AppRoutes.login} child={
				<ProfilePage />
			}/> }/>

			<Route path={AppRoutes.order+'/:id'} element={
				<ProtectedRoute allowed={!!accessToken} redirect={AppRoutes.login} child={
				<OrderPage />
			}/> }/>

			<Route path={AppRoutes.login} element={
				<ProtectedRoute allowed={!accessToken} redirect={AppRoutes.profile} child={
					<LoginPage /> 
			}/> }/>

			<Route path={AppRoutes.setPassword} element={
				<SetPasswordPage />
			} />

			<Route path={AppRoutes.success} element={
				<SuccessPage />
			} />

			<Route path={AppRoutes.admin} element={
				<Navigate to={AppRoutes.adminDashboard} replace />
			} />

			<Route path={AppRoutes.adminDashboard} element={
				<ProtectedRoute allowed={!!isAdmin} redirect={AppRoutes.catalogue} child={
					<DashboardPage />
				} />
			} />

			<Route path={AppRoutes.adminOrders} element={
				<ProtectedRoute allowed={!!isAdmin} redirect={AppRoutes.catalogue} child={
					<OrdersPage />
				} />
			} />

			<Route path={AppRoutes.adminProducts} element={
				<ProtectedRoute allowed={!!isAdmin} redirect={AppRoutes.catalogue} child={
					<ProductsPage />
				} />
			} />

			<Route path={AppRoutes.adminSales} element={
				<ProtectedRoute allowed={!!isAdmin} redirect={AppRoutes.catalogue} child={
					<SalesPage />
				} />
			} />

			<Route path={AppRoutes.adminUsers} element={
				<ProtectedRoute allowed={!!isAdmin} redirect={AppRoutes.catalogue} child={
					<UsersPage />
				} />
			} />

		</Routes>
	);
}

function ProtectedRoute(props: {
    allowed: any
	redirect: string
	child: React.ReactNode
}) {
    if (!props.allowed) 
		return <Navigate replace to={props.redirect} />
    return props.child
}


export {
	AppRoutes,
	AppRoutesComponent,
	ProtectedRoute,
}