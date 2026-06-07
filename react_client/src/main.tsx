import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/themes.css"
import { ThemeProvider } from "./core/providers/themeprovider"

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<ThemeProvider>
			<App />
		</ThemeProvider>
	</React.StrictMode>,
);

// npm run dev
// - run server
