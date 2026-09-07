import { AppBar } from "./AppBar";
import { ViewPort } from "./ViewPort";

export function Scaffold({children}: {children: React.ReactNode}) {

    return (
        <div className="min-h-screen bg-slate-50">
            <AppBar />
            <ViewPort>
                {children}
            </ViewPort>
        </div>
    )
}