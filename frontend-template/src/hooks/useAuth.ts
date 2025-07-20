import { useState, useEffect } from "react"
import { useQueryClient, useMutation } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { logoutUser } from "../requests/user_requests"

export function useAuth() {
    const [token, setToken] = useState<string | null>(localStorage.getItem("jwt_token"))
    const queryClient = useQueryClient()
    const navigate = useNavigate()

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
            navigate({ to: "/login" })
        },
        onError: (error) => {
            console.error("Logout error:", error)
            setToken(null)
            queryClient.clear()
            navigate({ to: "/login" })
        },
    })

    const handleLogout = () => {
        logoutMutation.mutate()
    }

    const isAuthenticated = !!token

    return {
        token,
        setToken,
        isAuthenticated,
        logout: handleLogout,
        isLoggingOut: logoutMutation.isPending,
    }
}

export function isAuthenticated(): boolean {
    return !!localStorage.getItem("jwt_token")
}
