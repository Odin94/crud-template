import { FastifyPluginAsync } from "fastify"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import { z } from "zod/v4"
import { users as usersTable } from "../db/schema"

const users: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
    const zodFastify = fastify.withTypeProvider<ZodTypeProvider>()

    zodFastify.get(
        "/users",
        {
            schema: {
                response: {
                    200: getUsersResponseSchema,
                    500: errorResponseSchema,
                },
            },
        },
        async function (request, reply) {
            try {
                const allUsers = await fastify.db.select().from(usersTable)

                return {
                    success: true,
                    users: allUsers,
                }
            } catch (error) {
                reply.status(500)
                return {
                    success: false,
                    message: "Failed to fetch users from database",
                }
            }
        }
    )

    zodFastify.post(
        "/login",
        {
            schema: {
                body: loginBodySchema,
                response: {
                    200: loginSuccessResponseSchema,
                    401: errorResponseSchema,
                    400: errorResponseSchema,
                },
            },
        },
        async function (request, reply) {
            const { email, password } = request.body

            if (email === "test@example.com" && password === "password123") {
                const user = {
                    id: "user-123",
                    email: "test@example.com",
                    name: "Test User",
                }

                const token = "jwt-token-" + Date.now()

                return {
                    success: true,
                    message: "Login successful",
                    user,
                    token,
                }
            } else {
                reply.status(401)
                return {
                    success: false,
                    message: "Invalid email or password",
                }
            }
        }
    )

    zodFastify.post(
        "/logout",
        {
            schema: {
                headers: logoutHeadersSchema,
                response: {
                    200: successResponseSchema,
                    401: errorResponseSchema,
                },
            },
        },
        async function (request, reply) {
            const authHeader = request.headers.authorization

            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                reply.status(401)
                return {
                    success: false,
                    message: "No valid authorization token provided",
                }
            }

            const token = authHeader.replace("Bearer ", "")

            if (token.startsWith("jwt-token-")) {
                return {
                    success: true,
                    message: "Logout successful",
                }
            } else {
                reply.status(401)
                return {
                    success: false,
                    message: "Invalid token",
                }
            }
        }
    )

    zodFastify.get(
        "/me",
        {
            schema: {
                headers: meHeadersSchema,
                response: {
                    200: meSuccessResponseSchema,
                    401: errorResponseSchema,
                },
            },
        },
        async function (request, reply) {
            const authHeader = request.headers.authorization

            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                reply.status(401)
                return {
                    success: false,
                    message: "No valid authorization token provided",
                }
            }

            const token = authHeader.replace("Bearer ", "")

            if (token.startsWith("jwt-token-")) {
                const user = {
                    id: "user-123",
                    email: "test@example.com",
                    name: "Test User",
                }

                return {
                    success: true,
                    user,
                }
            } else {
                reply.status(401)
                return {
                    success: false,
                    message: "Invalid token",
                }
            }
        }
    )
}

// ============================================================================
// SCHEMA DEFINITIONS
// ============================================================================

// Common schemas
const errorResponseSchema = z.object({
    success: z.boolean(),
    message: z.string(),
})

const successResponseSchema = z.object({
    success: z.boolean(),
    message: z.string(),
})

const userSchema = z.object({
    id: z.string(),
    email: z.string(),
    name: z.string().optional(),
})

// GET /users schemas
const getUsersResponseSchema = z.object({
    success: z.boolean(),
    users: z.array(
        z.object({
            id: z.number(),
            name: z.string().nullable(),
            email: z.string().nullable(),
        })
    ),
})

// POST /login schemas
const loginBodySchema = z.object({
    email: z.email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
})

const loginSuccessResponseSchema = z.object({
    success: z.boolean(),
    message: z.string(),
    user: userSchema,
    token: z.string(),
})

// POST /logout schemas
const logoutHeadersSchema = z.object({
    authorization: z.string().optional(),
})

// GET /me schemas
const meHeadersSchema = z.object({
    authorization: z.string(),
})

const meSuccessResponseSchema = z.object({
    success: z.boolean(),
    user: userSchema,
})

export default users
