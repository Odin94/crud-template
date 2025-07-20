import { EventsChart } from "./EventsChart"
import { useAuth } from "../hooks/useAuth"

export function AnalyticsPage() {
    const { token } = useAuth()

    return (
        <div className="flex flex-col items-center py-10">
            <div className="w-full max-w-4xl mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Analytics Dashboard</h1>
            </div>

            <div className="w-full max-w-4xl">
                <EventsChart token={token!} />
            </div>
        </div>
    )
}
