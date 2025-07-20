import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { AuthContainer } from "../components/AuthContainer"
import { useAuth } from "../hooks/useAuth"

export const Route = createFileRoute("/login")({
    component: LoginPage,
})

function LoginPage() {
    const navigate = useNavigate()
    const { setToken } = useAuth()

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <AuthContainer
                onAuthSuccess={(data) => {
                    setToken(data.token)
                    navigate({ to: "/" })
                }}
            />
        </div>
    )
}
