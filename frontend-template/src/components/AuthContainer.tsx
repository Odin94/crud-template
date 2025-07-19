import { useState } from "react"
import { LoginForm } from "./LoginForm"
import { SignupForm } from "./SignupForm"
import type { LoginResponse } from "../types"

interface AuthContainerProps {
    onAuthSuccess: (data: LoginResponse) => void
}

export function AuthContainer({ onAuthSuccess }: AuthContainerProps) {
    const [isLogin, setIsLogin] = useState(true)

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-10">
            <div className="w-full max-w-md">
                <div className="flex mb-6">
                    <button
                        onClick={() => setIsLogin(true)}
                        className={`flex-1 py-2 px-4 rounded-l ${
                            isLogin ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                    >
                        Login
                    </button>
                    <button
                        onClick={() => setIsLogin(false)}
                        className={`flex-1 py-2 px-4 rounded-r ${
                            !isLogin ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                    >
                        Register
                    </button>
                </div>

                {isLogin ? <LoginForm onLoginSuccess={onAuthSuccess} /> : <SignupForm onSignupSuccess={onAuthSuccess} />}
            </div>
        </div>
    )
}
