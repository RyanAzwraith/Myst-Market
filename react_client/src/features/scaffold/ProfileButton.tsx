import { UserCircleIcon as OutlineIcon } from "@heroicons/react/24/outline"
import { UserCircleIcon as SolidIcon } from "@heroicons/react/24/solid"
import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"

import { useUser } from "@/providers/UserProvider"
import { api } from "@/api/api"
import { logger } from "@/core/logger"

function ProfileButton() {
    const { user } = useUser()
    const [isOpen, setIsOpen] = useState(false)
    const buttonRef = useRef<HTMLButtonElement>(null)
    const navigate = useNavigate()

    useEffect(() => {
        if (!isOpen) {
            buttonRef.current?.focus()
        }
    }, [isOpen])

    const handleClick = () => {
        if (user) {
            navigate("/profile")
        } else {
            setIsOpen(true)
        }
    }

    return (
        <>
            <button
                ref={buttonRef}
                type="button"
                className="user"
                onClick={handleClick}
                aria-expanded={isOpen}
                aria-haspopup="dialog"
            >
                {user ? <SolidIcon className="h-6 w-6" /> : <OutlineIcon className="h-6 w-6" />}
            </button>
            {isOpen && <LoginModal onClose={() => setIsOpen(false)} />}
        </>
    )
}

function LoginModal({ onClose }: { onClose: () => void }) {
    const { setUser } = useUser()
    const navigate = useNavigate()
    const modalRef = useRef<HTMLDivElement>(null)
    const firstInputRef = useRef<HTMLInputElement>(null)

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [errorMsg, setErrorMsg] = useState<string | null>(null)

    useEffect(() => {
        firstInputRef.current?.focus()

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose()
            }
        }

        const handleFocusIn = (event: FocusEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose()
            }
        }

        document.addEventListener("keydown", handleKeyDown)
        document.addEventListener("focusin", handleFocusIn)

        return () => {
            document.removeEventListener("keydown", handleKeyDown)
            document.removeEventListener("focusin", handleFocusIn)
        }
    }, [onClose])

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        if (!email) {
            setErrorMsg("Email required")
            return
        }

        if (!password) {
            setErrorMsg("Password required")
            return
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setErrorMsg("Invalid email")
            return
        }

        setErrorMsg(null)

        try {
            const data = await api.login(email, password)
            setUser(data)
            onClose()
        } catch (err) {
            setErrorMsg("User not found or incorrect password")
            logger.info("Login error", err)
        }
    }

    return (
        <div
            className="fixed inset-0 bg-black/40 flex items-center justify-center"
            onClick={onClose}
        >
            <div
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                className="w-full max-w-sm bg-white p-4 shadow"
                onClick={(event) => event.stopPropagation()}
            >
                <h2 className="mb-4 text-lg font-semibold text-slate-900">Sign in</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <label className="block text-sm text-slate-700">
                        <span className="sr-only">Email</span>
                        <input
                            ref={firstInputRef}
                            type="text"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            className="w-full border p-2"
                            placeholder="Email"
                        />
                    </label>

                    <label className="block text-sm text-slate-700">
                        <span className="sr-only">Password</span>
                        <input
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            className="w-full border p-2"
                            placeholder="Password"
                        />
                    </label>

                    {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}

                    <button
                        type="submit"
                        className="w-full bg-blue-600 px-4 py-2 text-white"
                    >
                        Login
                    </button>

                    <div className="pt-3">
                        <button
                            type="button"
                            onClick={() => navigate("/register")}
                        >
                            Register
                        </button>
                        <button
                            type="button"
                            className="text-slate-500 hover:text-slate-900"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export { ProfileButton }
