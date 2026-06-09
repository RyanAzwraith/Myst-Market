import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom"

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

	return (
		<BrowserRouter>
			<ThemeProvider>
				<UserProvider>
					<CartProvider>
						<Scaffold>
							<AppRoutes />
						</Scaffold>
					</CartProvider>
				</UserProvider>
			</ThemeProvider>
		</BrowserRouter>
	);
}
