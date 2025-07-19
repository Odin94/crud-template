import { useState } from "react"
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query"
import type { UsersResponse } from "../types"
import { fetchUsers, createUser } from "../user_requests"
import { EventsChart } from "./EventsChart"

interface UserManagementProps {
    token: string
    onLogout: () => void
    isLoggingOut?: boolean
}

export function UserManagement({ token, onLogout, isLoggingOut = false }: UserManagementProps) {
    const [form, setForm] = useState({ name: "", email: "", password: "" })
    const queryClient = useQueryClient()

    const {
        data: usersResponse,
        isLoading,
        error: fetchError,
    } = useQuery<UsersResponse>({
        queryKey: ["users"],
        queryFn: () => fetchUsers(token),
    })

    const createUserMutation = useMutation({
        mutationFn: createUser,
        onSuccess: () => {
            setForm({ name: "", email: "", password: "" })
            queryClient.invalidateQueries({ queryKey: ["users"] })
        },
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        createUserMutation.mutate(form)
    }

    const users = usersResponse?.users || []

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-lg text-gray-600">Loading users...</div>
            </div>
        )
    }

    if (fetchError) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-lg text-red-600">Error loading users: {fetchError.message}</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10">
            <div className="w-full max-w-4xl flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
                <button
                    onClick={onLogout}
                    disabled={isLoggingOut}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition disabled:bg-red-400 disabled:cursor-not-allowed"
                >
                    {isLoggingOut ? "Logging out..." : "Logout"}
                </button>
            </div>

            <div className="w-full max-w-md bg-white rounded-lg shadow p-6 mb-8">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Create New User</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                    {createUserMutation.error && <div className="text-red-500 text-sm">{createUserMutation.error.message}</div>}
                    <button
                        type="submit"
                        className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                        disabled={createUserMutation.isPending}
                    >
                        {createUserMutation.isPending ? "Creating..." : "Create User"}
                    </button>
                </form>
            </div>

            <div className="w-full max-w-md bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">User List</h2>
                {users.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No users found</p>
                ) : (
                    <ul>
                        {users.map((user) => (
                            <li key={user.id} className="border-b last:border-b-0 py-2 flex flex-col">
                                <span className="font-medium text-gray-900">{user.name || "No name"}</span>
                                <span className="text-gray-600 text-sm">{user.email || "No email"}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="w-full max-w-4xl">
                <EventsChart token={token} />
            </div>
        </div>
    )
}
