import { UserCircleIcon as OutlineIcon } from "@heroicons/react/24/outline"
import { UserCircleIcon as SolidIcon } from "@heroicons/react/24/solid"
import { useNavigate } from "react-router-dom"
import { useState } from "react"

import { useUser } from "@/providers/UserProvider"

function ProfileButton() {
    const { user, setUser } = useUser()
    const [toggle, setToggle] = useState(false)
    const navigate = useNavigate()

    const callback = () => {
        if (user) {
            navigate("/profile")
        } else {
            setToggle(true)
        }
    }

    return (
        <button className="user" onClick={callback}>
            {user ? <SolidIcon className="h-6 w-6" /> : <OutlineIcon className="h-6 w-6" />}
            {toggle && <LoginPopup cb={() => setToggle(false)} />}
        </button>
    )
}

function LoginPopup({ cb }: { cb: () => void }) {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [errorMsg, setErrorMsg] = useState(null as string | null)

    function handleSubmit(e: React.SubmitEvent) {
        e.preventDefault()

        if (!email) {
            setErrorMsg("Email required")
        } else if (!password) {
            setErrorMsg("Password required")
        } else if (! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setErrorMsg("Invalid email") 
        } else {
            setErrorMsg(null)
        }
        

    }
    
    const navigate = useNavigate()

    return (
        <form onMouseLeave={cb} onSubmit={handleSubmit} className="space-y-4">
            <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border p-2 w-full"
                placeholder="Email" 
                    />

            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border p-2 w-full"
                placeholder="Password" 
                />

            {errorMsg && <p className="text-red-500">{errorMsg}</p>}
    
            <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2">
                Login
            </button>
            <hr />
            <button onClick={() => navigate("/register")}>Register</button>
        </form>
    )
}

export { ProfileButton };
