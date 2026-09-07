import { BrowserRouter, } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import "@/app.css";

import { PageRoutesComponent } from '@/app/PageRoutes';
import { refreshToken } from "@/implementations/server/http/api"
import { ThemeProvider } from "@/app/ThemeProvider";;
import { Scaffold } from "@/app/Scaffold";


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
						<PageRoutesComponent />
					</Scaffold>
				</ThemeProvider>
			</BrowserRouter>
		</QueryClientProvider>
	);
}
