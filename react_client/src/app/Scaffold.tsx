import {
	useEffect,
	useLayoutEffect,
	useState,
} from "react";
import { useLocation } from "react-router-dom";
import { AppBar } from "./AppBar";
import { Container } from "@/shared/composition";
import { useRefreshMutation, useAuthState } from "@/features/auth";
import { config } from "@/core/config";


export function Scaffold({children}: {children: React.ReactNode}) {
	const { pathname, search } = useLocation();
	const [authReady, setAuthReady] = useState(
		() => !useAuthState.getState().user
	);
	const { mutate: refresh } = useRefreshMutation({
		onSuccess: () => setAuthReady(true),
		onError: () => setAuthReady(true),
	});

	useEffect(() => {
		window.history.scrollRestoration = "manual";
		return () => {
			window.history.scrollRestoration = "auto";
		};
	}, []);

	useEffect(() => {
		if (useAuthState.getState().user) {
			refresh();
		} else {
			setAuthReady(true);
		}
	}, [refresh]);

	useLayoutEffect(() => {
		const root = document.documentElement;
		const previousScrollBehavior = root.style.scrollBehavior;
		root.style.scrollBehavior = "auto";

		const resetScroll = () => {
			window.scrollTo({ top: 0, left: 0, behavior: "auto" });
			root.scrollTop = 0;
			document.body.scrollTop = 0;
		};

		resetScroll();
		const frame = window.requestAnimationFrame(() => {
			resetScroll();
			root.style.scrollBehavior = previousScrollBehavior;
		});

		return () => {
			window.cancelAnimationFrame(frame);
			root.style.scrollBehavior = previousScrollBehavior;
		};
	}, [pathname, search]);
    
    return (
    <div className="scaffold">
        <AppBar />
		<aside className="demo-banner" role="note" aria-label="Demo website notice">
			<strong>Demo website:</strong> Feel free to explore, log in, and check out. No real charges will be made.
			{config.VITE_SERVER_IMPLEMENTATION === "mock" && (
				<span className="demo-banner-server-status">
					Mock server implementation is active.
				</span>
			)}
		</aside>
        <Container>
            {authReady && children}
        </Container>
        <footer className="app-footer" aria-hidden="true" />
    </div>
    )
}