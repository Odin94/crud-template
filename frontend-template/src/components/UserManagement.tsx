import { useQuery } from "@tanstack/react-query"
import type { UsersResponse } from "../types"
import { fetchUsers } from "../user_requests"
import { useAuth } from "../hooks/useAuth"

export function UserManagement() {
    const { token } = useAuth()

    const {
        data: usersResponse,
        isLoading,
        error: fetchError,
    } = useQuery<UsersResponse>({
        queryKey: ["users"],
        queryFn: () => fetchUsers(token!),
        enabled: !!token,
    })

    if (isLoading) {
        return (
            <div className="flex flex-col items-center py-10">
                <div className="text-lg text-gray-600">Loading users...</div>
            </div>
        )
    }

    if (fetchError) {
        return (
            <div className="flex flex-col items-center py-10">
                <div className="text-lg text-red-600">Error loading users: {fetchError.message}</div>
            </div>
        )
    }

    const users = usersResponse?.users || []

    return (
        <div className="flex flex-col items-center py-10">
            <div className="w-full max-w-4xl mb-8">
                <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
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
        </div>
    )
}
