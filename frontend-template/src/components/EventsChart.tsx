import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { fetchAllEvents } from "../requests/user_requests"
import { Chart } from "./ui/chart"

type EventsChartProps = {
    token: string
}

type ChartData = {
    name: string
    total: number
}

export function EventsChart({ token }: EventsChartProps) {
    const [chartData, setChartData] = useState<ChartData[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const {
        data: eventsResponse,
        isLoading: isFetching,
        error,
    } = useQuery({
        queryKey: ["all-events"],
        queryFn: () => fetchAllEvents(token, { limit: 1000, offset: 0 }),
        refetchInterval: 30000,
    })

    useEffect(() => {
        if (eventsResponse?.events) {
            const userEventCounts = eventsResponse.events.reduce(
                (acc, event) => {
                    const userId = event.user_id || "Anonymous"
                    acc[userId] = (acc[userId] || 0) + 1
                    return acc
                },
                {} as Record<string, number>
            )

            const data: ChartData[] = Object.entries(userEventCounts)
                .map(([userId, count]) => ({
                    name: userId === "Anonymous" ? "Anonymous" : `User ${userId.slice(0, 8)}...`,
                    total: count,
                }))
                .sort((a, b) => b.total - a.total)
                .slice(0, 10)

            setChartData(data)
            setIsLoading(false)
        }
    }, [eventsResponse])

    if (isFetching || isLoading) {
        return (
            <div className="w-full bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Events by User</h2>
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg text-gray-600">Loading events...</div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="w-full bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Events by User</h2>
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg text-red-600">Error loading events: {error.message}</div>
                </div>
            </div>
        )
    }

    if (chartData.length === 0) {
        return (
            <div className="w-full bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Events by User</h2>
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg text-gray-500">No events found</div>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Events by User</h2>
            <div className="mb-4 text-sm text-gray-600">Showing top {chartData.length} users by event count</div>
            <Chart data={chartData} />
            <div className="mt-4 text-xs text-gray-500">Total events: {eventsResponse?.total || 0}</div>
        </div>
    )
}
