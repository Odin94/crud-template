import bcrypt from "bcrypt"
import { eq } from "drizzle-orm"
import { FastifyPluginAsync } from "fastify"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import { z } from "zod/v4"
import { users as usersTable } from "../db/schema"
import { generateToken, verifyToken, extractTokenFromHeader } from "../utils/jwt"

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
                const users = await fastify.db
                    .select({
                        id: usersTable.id,
                        email: usersTable.email,
                        name: usersTable.name,
                    })
                    .from(usersTable)

                return {
                    users,
                }
            } catch (error) {
                reply.status(500)
                return {
                    message: "Failed to fetch users from database",
                }
            }
        }
    )

    zodFastify.post(
        "/users",
        {
            schema: {
                body: createUserBodySchema,
                response: {
                    200: loginSuccessResponseSchema,
                    400: errorResponseSchema,
                    409: errorResponseSchema,
                },
            },
        },
        async function (request, reply) {
            const { name, email, password } = request.body

            const saltedPasswordHash = await bcrypt.hash(password, 12)

            const existingUsers = await fastify.db.select().from(usersTable).where(eq(usersTable.email, email))

            if (existingUsers.length > 0) {
                reply.status(409)
                return {
                    message: "User with this email already exists",
                }
            }

            const [newUser] = await fastify.db
                .insert(usersTable)
                .values({
                    name,
                    email,
                    saltedPasswordHash,
                })
                .returning()

            if (!newUser) {
                reply.status(500)
                return {
                    message: "Failed to create user",
                }
            }

            const token = generateToken({
                userId: String(newUser.id),
                email: newUser.email,
                name: newUser.name,
            })

            return {
                user: {
                    id: String(newUser.id),
                    email: newUser.email,
                    name: newUser.name,
                },
                token,
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

            request.log.info("-----------------------")
            request.log.info({ email, password })
            try {
                const [user] = await fastify.db
                    .select({
                        id: usersTable.id,
                        email: usersTable.email,
                        name: usersTable.name,
                        saltedPasswordHash: usersTable.saltedPasswordHash,
                    })
                    .from(usersTable)
                    .where(eq(usersTable.email, email))

                request.log.info("user", user)
                if (!user || !user.saltedPasswordHash) {
                    reply.status(401)
                    return {
                        message: "Invalid email or password",
                    }
                }

                const isPasswordValid = await bcrypt.compare(password, user.saltedPasswordHash)

                if (!isPasswordValid) {
                    reply.status(401)
                    return {
                        message: "Invalid email or password",
                    }
                }

                const token = generateToken({
                    userId: String(user.id),
                    email: user.email,
                    name: user.name,
                })

                return {
                    user: {
                        id: String(user.id),
                        email: user.email,
                        name: user.name,
                    },
                    token,
                }
            } catch (error) {
                request.log.error(error)
                reply.status(500)
                return {
                    message: "Internal server error",
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
                    message: "No valid authorization token provided",
                }
            }

            const token = authHeader.replace("Bearer ", "")

            if (token.startsWith("jwt-token-")) {
                return {
                    message: "Logout successful",
                }
            } else {
                reply.status(401)
                return {
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
            try {
                const token = extractTokenFromHeader(request.headers.authorization)
                const payload = verifyToken(token)

                const [user] = await fastify.db
                    .select({
                        id: usersTable.id,
                        email: usersTable.email,
                        name: usersTable.name,
                    })
                    .from(usersTable)
                    .where(eq(usersTable.id, payload.userId))

                if (!user) {
                    reply.status(401)
                    return {
                        message: "User not found",
                    }
                }

                return {
                    user: {
                        id: String(user.id),
                        email: user.email,
                        name: user.name,
                    },
                }
            } catch (error) {
                request.log.error(error)
                reply.status(401)
                return {
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
    message: z.string(),
})

const successResponseSchema = z.object({
    message: z.string(),
})

const userSchema = z.object({
    id: z.string(),
    email: z.string(),
    name: z.string().optional(),
})

// GET /users schemas
const getUsersResponseSchema = z.object({
    users: z.array(userSchema),
})

const createUserBodySchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.email("Invalid email format"),
    password: z.string().min(8, "Password must be at least 8 characters"),
})

const loginBodySchema = z.object({
    email: z.email("Invalid email format"),
    password: z.string(),
})

const loginSuccessResponseSchema = z.object({
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
    user: userSchema,
})

export default users
