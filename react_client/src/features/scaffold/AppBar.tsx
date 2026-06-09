import { useNavigate } from "react-router-dom"
import { Cart } from "../cart/Cart";
import { ProfileButton } from "./ProfileButton";



export function AppBar() {
    const navigate = useNavigate()
    return (
        <div className="app-bar flex items-center justify-between bg-slate-300 px-4 py-3">
            <h1 className="text-xl font-semibold">Myst Market</h1>
            <div className="flex items-center gap-2">
                <button className="rounded bg-slate-800 px-3 py-1 text-sm text-white hover:bg-slate-900" onClick={() => navigate("/catalogue")}>Catalogue</button>
                <button className="rounded bg-slate-800 px-3 py-1 text-sm text-white hover:bg-slate-900" onClick={() => navigate("/shop")}>Shopping</button>
                <Cart />
                <ProfileButton />
            </div>
        </div>
    )
}