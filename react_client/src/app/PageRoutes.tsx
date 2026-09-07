import { Routes, Route, Navigate } from "react-router-dom"
import { useAuthState } from "@/features/user"

import { CataloguePage } from "@/pages/catalogue"
import { ShopPage } from "@/pages/shop"
import { ProductPage } from "@/pages/product"
import { SalePage } from "@/pages/sale"
import { CheckoutPage } from "@/pages/checkout"
import { RegisterPage } from "@/pages/register"
import { ProfilePage } from "@/pages/profile"
import { OrderPage } from "@/pages/order"
import { LoginPage } from "@/pages/login"
import { SetPasswordPage } from "@/pages/setPassword"
import { SuccessPage } from "@/pages/success"
import { DashboardPage } from "@/pages/admin/dashboard"
import { OrdersPage } from "@/pages/admin/orders"
import { ProductsPage } from "@/pages/admin/products"
import { SalesPage } from "@/pages/admin/sales"
import { UsersPage } from "@/pages/admin/users"


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
	const isAdmin = useAuthState(state => state.user?.isAdmin)
	
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
				<CheckoutPage />
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