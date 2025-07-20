import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import type { LoginResponse } from "../types"
import { loginUser } from "../user_requests"

interface LoginFormProps {
    onLoginSuccess: (data: LoginResponse) => void
}

export function LoginForm({ onLoginSuccess }: LoginFormProps) {
    const [form, setForm] = useState({ email: "", password: "" })

    const loginMutation = useMutation({
        mutationFn: loginUser,
        onSuccess: (data) => {
            setForm({ email: "", password: "" })
            onLoginSuccess(data)
        },
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        loginMutation.mutate({ email: form.email, password: form.password })
    }

    return (
        <div className="w-full bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Login</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                {loginMutation.error && <div className="text-red-500 text-sm">{loginMutation.error.message}</div>}
                <button
                    type="submit"
                    className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    disabled={loginMutation.isPending}
                >
                    {loginMutation.isPending ? "Logging in..." : "Login"}
                </button>
            </form>
        </div>
    )
}
