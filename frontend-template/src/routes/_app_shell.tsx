import { createFileRoute, Outlet, Link } from "@tanstack/react-router"
import { useAuth } from "../hooks/useAuth"

export const Route = createFileRoute("/_app_shell")({
    component: AppShell,
})

function AppShell() {
    const { logout, isLoggingOut } = useAuth()

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex gap-4">
                            <Link to="/" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                                Dashboard
                            </Link>
                            <Link to="/analytics" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">
                                Analytics
                            </Link>
                        </div>
                        <button
                            onClick={logout}
                            disabled={isLoggingOut}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition disabled:bg-red-400 disabled:cursor-not-allowed"
                        >
                            {isLoggingOut ? "Logging out..." : "Logout"}
                        </button>
                    </div>
                </div>
            </div>

            <Outlet />
        </div>
    )
}
