import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, data } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "./styles/themes.css"
import "./styles/main.css"

import { ThemeProvider } from "@/providers/ThemeProvider";
import { UserProvider } from "@/providers/UserProvider";
import { CartProvider } from "@/providers/CartProvider";
import { Scaffold } from "./features/scaffold/Scaffold";

import { Catalogue } from "./features/catalogue/Catalogue";
import { Shop } from "./features/shop/Shop";
import { CheckOut } from "./features/checkout/CheckOut";
import { Register } from "./features/register/Register";
import { Profile } from "./features/profile/Profile";

import { api } from "@/api/api";

export function AppRoutes() {
    return (
        <Routes>
			<Route path="*" element={<Catalogue />} />
			<Route path="/catalogue" element={<Catalogue />} />
			<Route path="/shop" element={<Shop />} />
			<Route path="/checkout" element={<CheckOut />} />
			<Route path="/register" element={<Register />} />
			<Route path="/profile" element={<Profile />} />

        </Routes>
    )
}

export function App() {

	const queryClient = new QueryClient()
	const [health, setHealth] = useState("")

	useEffect(() => {
		api.getHealth().then((data) => setHealth(data.message))
	}, [])

	return (
		<QueryClientProvider client={queryClient}>
			<BrowserRouter>
				<ThemeProvider>
					<UserProvider>
						<CartProvider>
							<Scaffold>
								<h1>{health}</h1>
								<AppRoutes />
							</Scaffold>
						</CartProvider>
					</UserProvider>
				</ThemeProvider>
			</BrowserRouter>
		</QueryClientProvider>
		
	);
}
