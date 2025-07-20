import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import type { LoginResponse } from "../types"
import { createUser } from "../requests/user_requests"
import { Button } from "./ui/button"

interface SignupFormProps {
    onSignupSuccess: (data: LoginResponse) => void
}

export function SignupForm({ onSignupSuccess }: SignupFormProps) {
    const [form, setForm] = useState({ name: "", email: "", password: "" })

    const createUserMutation = useMutation({
        mutationFn: createUser,
        onSuccess: (data) => {
            setForm({ name: "", email: "", password: "" })
            onSignupSuccess(data)
        },
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        createUserMutation.mutate(form)
    }

    return (
        <div className="w-full bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Create Account</h2>
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
                <Button type="submit" className="w-full" disabled={createUserMutation.isPending}>
                    {createUserMutation.isPending ? "Creating..." : "Create Account"}
                </Button>
            </form>
        </div>
    )
}
