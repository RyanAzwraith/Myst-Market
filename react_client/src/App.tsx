import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "@/app.css";

import { ThemeProvider } from "@/ThemeProvider";
import { Scaffold } from "./scaffold/Scaffold";

import { Catalogue } from "./features/catalogue/Catalogue";
import { Shop } from "./features/shop/Shop";
import { CheckOut } from "./features/checkout/CheckOut";
import { Register } from "./features/user/Register";
import { Profile } from "./features/user/Profile";

import { getHealth } from "@/api";

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
	);
}

export function App() {
	const queryClient = new QueryClient();
	const [health, setHealth] = useState("");

	useEffect(() => {
		getHealth().then((data) => setHealth(data.message));
	}, []);

	return (
		<QueryClientProvider client={queryClient}>
			<BrowserRouter>
				<ThemeProvider>
						<Scaffold>
							<h1>{health}</h1>
							<AppRoutes />
						</Scaffold>
				</ThemeProvider>
			</BrowserRouter>
		</QueryClientProvider>
	);
}
