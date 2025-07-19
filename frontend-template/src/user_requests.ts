import type { LoginResponse, UsersResponse } from "./types"

const API_BASE_URL = "http://localhost:3000"

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.message || "Request failed")
    }
    return response.json()
}

export async function loginUser(loginData: { email: string; password: string }): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
    })
    return handleResponse<LoginResponse>(response)
}

export async function createUser(userData: { name: string; email: string; password: string }): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
    })
    return handleResponse<LoginResponse>(response)
}

export async function fetchUsers(token: string): Promise<UsersResponse> {
    const response = await fetch(`${API_BASE_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
    })
    return handleResponse<UsersResponse>(response)
}

export async function logoutUser(token: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/logout`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
    return handleResponse<{ message: string }>(response)
}
