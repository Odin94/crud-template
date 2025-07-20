import { createFileRoute } from "@tanstack/react-router"
import { UserManagement } from "../../components/UserManagement"
import { isAuthenticated } from "../../hooks/useAuth"

export const Route = createFileRoute("/_app_shell/")({
    beforeLoad: async () => {
        const authed = await isAuthenticated()
        if (!authed) {
            return "/login"
        }
    },
    component: UserManagement,
})
