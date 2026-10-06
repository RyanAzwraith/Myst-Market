import { useEffect } from "react";
import { AppBar } from "./AppBar";
import { Container } from "@/shared/composition";
import { useRefreshMutation } from "@/features/auth";


export function Scaffold({children}: {children: React.ReactNode}) {
	const { mutate: refresh } = useRefreshMutation({});

	useEffect(() => {
		refresh();
	}, []);
    
    return (
        <div className="min-h-screen bg-slate-50">
            <AppBar />
            <Container>
                {children}
            </Container>
        </div>
    )
}