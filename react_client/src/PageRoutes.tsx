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


const PageRoutes = {
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

function PageRoutesComponent() {
	const accessToken = useAuthState(state => state.accessToken)
	const isAdmin = useAuthState(state => state.userModel?.isAdmin)
	
	return (
		<Routes>

			<Route path={PageRoutes.default} element={
				<Navigate to={PageRoutes.catalogue} replace />
			} />

			<Route path={PageRoutes.catalogue} element={
				<CataloguePage />
			} />

			<Route path={PageRoutes.shop} element={
				<ShopPage />
			} />

			<Route path={PageRoutes.product+'/:slug'} element={
				<ProductPage />
			} />

			<Route path={PageRoutes.sale+'/:slug'} element={
				<SalePage />
			} />

			<Route path={PageRoutes.checkout} element={
				<CheckOutPage />
			} />

			<Route path={PageRoutes.register} element={
				<ProtectedRoute allowed={!accessToken} redirect={PageRoutes.profile} child={
					<RegisterPage /> 
			}/> }/>

			<Route path={PageRoutes.profile} element={
				<ProtectedRoute allowed={!!accessToken} redirect={PageRoutes.login} child={
				<ProfilePage />
			}/> }/>

			<Route path={PageRoutes.order+'/:id'} element={
				<ProtectedRoute allowed={!!accessToken} redirect={PageRoutes.login} child={
				<OrderPage />
			}/> }/>

			<Route path={PageRoutes.login} element={
				<ProtectedRoute allowed={!accessToken} redirect={PageRoutes.profile} child={
					<LoginPage /> 
			}/> }/>

			<Route path={PageRoutes.setPassword} element={
				<SetPasswordPage />
			} />

			<Route path={PageRoutes.success} element={
				<SuccessPage />
			} />

			<Route path={PageRoutes.admin} element={
				<Navigate to={PageRoutes.adminDashboard} replace />
			} />

			<Route path={PageRoutes.adminDashboard} element={
				<ProtectedRoute allowed={!!isAdmin} redirect={PageRoutes.catalogue} child={
					<DashboardPage />
				} />
			} />

			<Route path={PageRoutes.adminOrders} element={
				<ProtectedRoute allowed={!!isAdmin} redirect={PageRoutes.catalogue} child={
					<OrdersPage />
				} />
			} />

			<Route path={PageRoutes.adminProducts} element={
				<ProtectedRoute allowed={!!isAdmin} redirect={PageRoutes.catalogue} child={
					<ProductsPage />
				} />
			} />

			<Route path={PageRoutes.adminSales} element={
				<ProtectedRoute allowed={!!isAdmin} redirect={PageRoutes.catalogue} child={
					<SalesPage />
				} />
			} />

			<Route path={PageRoutes.adminUsers} element={
				<ProtectedRoute allowed={!!isAdmin} redirect={PageRoutes.catalogue} child={
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
	PageRoutes,
	PageRoutesComponent,
	ProtectedRoute,
}