import { BrowserRouter, } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import "@/app.css";

import { ThemeProvider } from "@/ThemeProvider";
import { Scaffold } from "./scaffold/Scaffold";

import { AppRoutesComponent } from '@/AppRoutes.tsx';
import { refreshToken } from "@/api"

export function App() {
	const queryClient = new QueryClient();

	useEffect(() => {
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
