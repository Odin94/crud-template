import { createFileRoute, Outlet, Link } from "@tanstack/react-router"
import { useAuth } from "../hooks/useAuth"
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "../components/ui/navigation-menu"
import { Button } from "../components/ui/button"
import { cn } from "../lib/utils"

export const Route = createFileRoute("/_app_shell")({
    component: AppShell,
})

function AppShell() {
    const { logout, isLoggingOut } = useAuth()

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <NavigationMenu>
                            <NavigationMenuList>
                                <NavigationMenuItem>
                                    <Link to="/">
                                        <NavigationMenuLink
                                            className={cn(
                                                "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                                            )}
                                        >
                                            Dashboard
                                        </NavigationMenuLink>
                                    </Link>
                                </NavigationMenuItem>
                                <NavigationMenuItem>
                                    <Link to="/analytics">
                                        <NavigationMenuLink
                                            className={cn(
                                                "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                                            )}
                                        >
                                            Analytics
                                        </NavigationMenuLink>
                                    </Link>
                                </NavigationMenuItem>
                            </NavigationMenuList>
                        </NavigationMenu>

                        <Button onClick={logout} disabled={isLoggingOut} variant="destructive">
                            {isLoggingOut ? "Logging out..." : "Logout"}
                        </Button>
                    </div>
                </div>
            </div>

            <Outlet />
        </div>
    )
}
