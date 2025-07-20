import { useState } from "react"
import { LoginForm } from "./LoginForm"
import { SignupForm } from "./SignupForm"
import { Button } from "./ui/button"
import type { LoginResponse } from "../types"

interface AuthContainerProps {
    onAuthSuccess: (data: LoginResponse) => void
}

export function AuthContainer({ onAuthSuccess }: AuthContainerProps) {
    const [isLogin, setIsLogin] = useState(true)

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-10">
            <div className="w-md">
                <div className="flex mb-6">
                    <Button onClick={() => setIsLogin(true)} variant={isLogin ? "default" : "outline"} className="flex-1 rounded-r-none">
                        Login
                    </Button>
                    <Button onClick={() => setIsLogin(false)} variant={!isLogin ? "default" : "outline"} className="flex-1 rounded-l-none">
                        Register
                    </Button>
                </div>

                {isLogin ? <LoginForm onLoginSuccess={onAuthSuccess} /> : <SignupForm onSignupSuccess={onAuthSuccess} />}
            </div>
        </div>
    )
}
