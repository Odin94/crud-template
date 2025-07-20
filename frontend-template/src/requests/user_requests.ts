import type { LoginResponse, UsersResponse, EventsResponse } from "../types"
import { env } from "../lib/env"

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.message || "Request failed")
    }
    return response.json()
}

export async function loginUser(loginData: { email: string; password: string }): Promise<LoginResponse> {
    const response = await fetch(`${env.API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
    })
    return handleResponse<LoginResponse>(response)
}

export async function createUser(userData: { name: string; email: string; password: string }): Promise<LoginResponse> {
    const response = await fetch(`${env.API_BASE_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
    })
    return handleResponse<LoginResponse>(response)
}

export async function fetchUsers(token: string): Promise<UsersResponse> {
    const response = await fetch(`${env.API_BASE_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
    })
    return handleResponse<UsersResponse>(response)
}

export async function logoutUser(token: string): Promise<{ message: string }> {
    const response = await fetch(`${env.API_BASE_URL}/logout`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
    return handleResponse<{ message: string }>(response)
}

export async function fetchMyEvents(
    token: string,
    options?: { limit?: number; offset?: number; event_name?: string }
): Promise<EventsResponse> {
    const params = new URLSearchParams()
    if (options?.limit) params.append("limit", options.limit.toString())
    if (options?.offset) params.append("offset", options.offset.toString())
    if (options?.event_name) params.append("event_name", options.event_name)

    const response = await fetch(`${env.API_BASE_URL}/analytics/my-events?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
    })
    return handleResponse(response)
}

export async function fetchSessionEvents(
    token: string,
    sessionId: string,
    options?: { limit?: number; offset?: number; event_name?: string }
): Promise<EventsResponse> {
    const params = new URLSearchParams()
    if (options?.limit) params.append("limit", options.limit.toString())
    if (options?.offset) params.append("offset", options.offset.toString())
    if (options?.event_name) params.append("event_name", options.event_name)

    const response = await fetch(`${env.API_BASE_URL}/analytics/session/${sessionId}?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
    })
    return handleResponse(response)
}

export async function fetchTimeRangeEvents(
    token: string,
    startTime: string,
    endTime: string,
    options?: { limit?: number; offset?: number }
): Promise<EventsResponse> {
    const params = new URLSearchParams({
        start_time: startTime,
        end_time: endTime,
    })
    if (options?.limit) params.append("limit", options.limit.toString())
    if (options?.offset) params.append("offset", options.offset.toString())

    const response = await fetch(`${env.API_BASE_URL}/analytics/time-range?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
    })
    return handleResponse(response)
}

export async function fetchAnalyticsStats(token: string): Promise<{
    totalEvents: number
    uniqueEventTypes: number
    mostFrequentEvent: { name: string; count: number } | null
    eventBreakdown: Record<string, number>
}> {
    const response = await fetch(`${env.API_BASE_URL}/analytics/stats`, {
        headers: { Authorization: `Bearer ${token}` },
    })
    return handleResponse(response)
}

export async function fetchAllEvents(token: string, options?: { limit?: number; offset?: number }): Promise<EventsResponse> {
    const params = new URLSearchParams()
    if (options?.limit) params.append("limit", options.limit.toString())
    if (options?.offset) params.append("offset", options.offset.toString())

    const response = await fetch(`${env.API_BASE_URL}/analytics/events?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
    })
    return handleResponse(response)
}
