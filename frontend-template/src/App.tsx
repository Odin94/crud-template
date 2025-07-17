import { useState, useEffect } from "react"
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query"
import "./index.css"

type User = {
    id: string
    name: string
    email: string
}

type UsersResponse = {
    users: User[]
}

type LoginResponse = {
    user: User
    token: string
}

function App() {
    const [isLogin, setIsLogin] = useState(true)
    const [form, setForm] = useState({ name: "", email: "", password: "" })
    const [token, setToken] = useState<string | null>(localStorage.getItem("jwt_token"))
    const queryClient = useQueryClient()

    // Store token in localStorage when it changes
    useEffect(() => {
        if (token) {
            localStorage.setItem("jwt_token", token)
        } else {
            localStorage.removeItem("jwt_token")
        }
    }, [token])

    // Fetch users using React Query (now with auth)
    const {
        data: usersResponse,
        isLoading,
        error: fetchError,
    } = useQuery<UsersResponse>({
        queryKey: ["users"],
        queryFn: async () => {
            const response = await fetch("http://localhost:3000/users", {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            })
            if (!response.ok) {
                throw new Error("Failed to fetch users")
            }
            return response.json()
        },
        enabled: !!token, // Only fetch if we have a token
    })

    const users = usersResponse?.users || []

    // Login mutation
    const loginMutation = useMutation({
        mutationFn: async (loginData: { email: string; password: string }) => {
            const res = await fetch("http://localhost:3000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(loginData),
            })
            if (!res.ok) {
                const data = await res.json().catch(() => ({}))
                throw new Error(data.message || "Login failed")
            }
            return res.json() as Promise<LoginResponse>
        },
        onSuccess: (data) => {
            setToken(data.token)
            setForm({ name: "", email: "", password: "" })
            queryClient.invalidateQueries({ queryKey: ["users"] })
        },
    })

    // Create user mutation
    const createUserMutation = useMutation({
        mutationFn: async (userData: { name: string; email: string; password: string }) => {
            const res = await fetch("http://localhost:3000/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData),
            })
            if (!res.ok) {
                const data = await res.json().catch(() => ({}))
                throw new Error(data.message || "Failed to create user")
            }
            return res.json() as Promise<LoginResponse>
        },
        onSuccess: (data) => {
            setToken(data.token) // Auto-login after registration
            setForm({ name: "", email: "", password: "" })
            queryClient.invalidateQueries({ queryKey: ["users"] })
        },
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (isLogin) {
            loginMutation.mutate({ email: form.email, password: form.password })
        } else {
            createUserMutation.mutate(form)
        }
    }

    const handleLogout = () => {
        setToken(null)
        queryClient.clear()
    }

    // Show login/register form if not authenticated
    if (!token) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center py-10">
                <div className="w-full max-w-md bg-white rounded-lg shadow p-6">
                    <div className="flex mb-6">
                        <button
                            onClick={() => setIsLogin(true)}
                            className={`flex-1 py-2 px-4 rounded-l ${
                                isLogin ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                        >
                            Login
                        </button>
                        <button
                            onClick={() => setIsLogin(false)}
                            className={`flex-1 py-2 px-4 rounded-r ${
                                !isLogin ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                        >
                            Register
                        </button>
                    </div>

                    <h2 className="text-2xl font-bold mb-4 text-gray-800">{isLogin ? "Login" : "Create Account"}</h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    required={!isLogin}
                                />
                            </div>
                        )}
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
                        {(loginMutation.error || createUserMutation.error) && (
                            <div className="text-red-500 text-sm">{loginMutation.error?.message || createUserMutation.error?.message}</div>
                        )}
                        <button
                            type="submit"
                            className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                            disabled={loginMutation.isPending || createUserMutation.isPending}
                        >
                            {loginMutation.isPending || createUserMutation.isPending
                                ? isLogin
                                    ? "Logging in..."
                                    : "Creating..."
                                : isLogin
                                ? "Login"
                                : "Create Account"}
                        </button>
                    </form>
                </div>
            </div>
        )
    }

    // Show main app when authenticated
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
                <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition">
                    Logout
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
        </div>
    )
}

export default App
