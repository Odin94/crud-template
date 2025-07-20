import { createFileRoute } from "@tanstack/react-router"
import { AnalyticsPage } from "../../components/AnalyticsPage"
import { isAuthenticated } from "../../hooks/useAuth"

export const Route = createFileRoute("/_app_shell/analytics")({
    beforeLoad: async () => {
        const authed = await isAuthenticated()
        if (!authed) {
            return "/login"
        }
    },
    component: AnalyticsPage,
})
