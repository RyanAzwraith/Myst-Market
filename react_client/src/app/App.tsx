import { BrowserRouter, } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import "./app.css";

import { PageRoutesComponent } from '@/app/PageRoutes';
import { Scaffold } from "@/app/Scaffold";



export function App() {
	const queryClient = new QueryClient();

	useEffect(() => {
		document.title = "Myst Market"
	}, []);

	return (
	<QueryClientProvider client={queryClient}>
		<BrowserRouter>
			<Scaffold>
				<PageRoutesComponent />
			</Scaffold>
		</BrowserRouter>
	</QueryClientProvider>
	);
}
