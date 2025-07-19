import { useState, useEffect } from "react"
import { useQueryClient, useMutation } from "@tanstack/react-query"
import "./index.css"
import { AuthContainer } from "./components/AuthContainer"
import { UserManagement } from "./components/UserManagement"
import type { LoginResponse } from "./types"
import { logoutUser } from "./user_requests"

function App() {
    const [token, setToken] = useState<string | null>(localStorage.getItem("jwt_token"))
    const queryClient = useQueryClient()

    useEffect(() => {
        if (token) {
            localStorage.setItem("jwt_token", token)
        } else {
            localStorage.removeItem("jwt_token")
        }
    }, [token])

    const logoutMutation = useMutation({
        mutationFn: () => logoutUser(token!),
        onSuccess: () => {
            setToken(null)
            queryClient.clear()
        },
        onError: (error) => {
            console.error("Logout error:", error)
            // Even if logout fails, clear local state
            setToken(null)
            queryClient.clear()
        },
    })

    const handleAuthSuccess = (data: LoginResponse) => {
        setToken(data.token)
        queryClient.invalidateQueries({ queryKey: ["users"] })
    }

    const handleLogout = () => {
        logoutMutation.mutate()
    }

    if (!token) {
        return <AuthContainer onAuthSuccess={handleAuthSuccess} />
    }

    return <UserManagement token={token} onLogout={handleLogout} isLoggingOut={logoutMutation.isPending} />
}

export default App
