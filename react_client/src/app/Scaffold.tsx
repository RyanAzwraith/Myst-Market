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
    <div className="scaffold">
        <AppBar />
        <Container>
            {children}
        </Container>
    </div>
    )
}