import { BrowserRouter, } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import "@/app.css";

import { ThemeProvider } from "@/ThemeProvider";
import { Scaffold } from "./scaffold/Scaffold";

import { AppRoutesComponent } from '@/AppRoutes.tsx';
import { refreshToken } from "@/api"
import { ThemeProvider } from "@/providers/ThemeProvider";;
import { Scaffold } from "./features/scaffold/Scaffold";

import { Catalogue } from "./features/catalogue/Catalogue";
import { Shop } from "./features/shop/ShopPage";
import { CheckOut } from "./features/checkout/CheckOut";

export function AppRoutes() {
    return (
        <Routes>
			<Route path="*" element={<Catalogue />} />
			<Route path="/catalogue" element={<Catalogue />} />
			<Route path="/shop" element={<Shop />} />
			<Route path="/checkout" element={<CheckOut />} />
        </Routes>
    )
}

export function App() {
	const queryClient = new QueryClient();

	useEffect(() => {
		document.title = "Myst Market"
		refreshToken();
	}, []);

	return (
		<QueryClientProvider client={queryClient}>
			<BrowserRouter>
				<ThemeProvider>
						<Scaffold>
							<AppRoutesComponent />
						</Scaffold>
				</ThemeProvider>
			</BrowserRouter>
		</QueryClientProvider>
	);
}
