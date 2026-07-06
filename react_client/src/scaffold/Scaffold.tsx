import { AppBar } from "./AppBar";
import { ViewPort } from "./ViewPort";

export function Scaffold({children}: {children: React.ReactNode}) {

    return (
        <div className="scaffold">
            <AppBar />
            <ViewPort>
                {children}
            </ViewPort>
        </div>
    )
}