import { BrowserRouter, } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import "@/app.css";

import { AppRoutesComponent } from '@/AppRoutes.tsx';
import { refreshToken } from "@/api"
import { ThemeProvider } from "@/ThemeProvider";;
import { Scaffold } from "@/scaffold/Scaffold";


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
