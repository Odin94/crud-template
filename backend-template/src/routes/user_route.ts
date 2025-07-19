import bcrypt from "bcrypt"
import { eq } from "drizzle-orm"
import { FastifyPluginAsync } from "fastify"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import { z } from "zod/v4"
import { userSchema, users as usersTable } from "../db/postgres_schema"
import { generateToken, verifyToken, extractTokenFromHeader } from "../utils/jwt"
import { SessionManager } from "../utils/sessions"
import { recordEvent } from "../db/clickhouse_requests"
import { UnauthorizedError, ConflictError, InternalServerError } from "../utils/errors"

const users: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
    const zodFastify = fastify.withTypeProvider<ZodTypeProvider>()

    zodFastify.get(
        "/users",
        {
            schema: {
                headers: authHeadersSchema,
                response: {
                    200: getUsersResponseSchema,
                },
            },
        },
        async function (request, reply) {
            const token = extractTokenFromHeader(request.headers.authorization)
            const payload = verifyToken(token)
            const { userId } = payload

            const users = await fastify.db
                .select({
                    id: usersTable.id,
                    email: usersTable.email,
                    name: usersTable.name,
                })
                .from(usersTable)

            fastify.log.info({ users: users.map(({ name, email }) => ({ name, email })) }, "Fetched users:")

            void recordEvent(fastify, "get_users", userId, {
                users: users.map(({ name, email }) => ({ name, email })),
            })

            return {
                users,
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
                },
            },
        },
        async function (request, reply) {
            const { name, email, password } = request.body

            const saltedPasswordHash = await bcrypt.hash(password, 12)

            const existingUsers = await fastify.db.select().from(usersTable).where(eq(usersTable.email, email))

            if (existingUsers.length > 0) {
                throw new ConflictError("User with this email already exists")
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
                throw new InternalServerError("Failed to create user")
            }

            const sessionId = SessionManager.createSession(String(newUser.id))
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
                sessionId,
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
                },
            },
        },
        async function (request, reply) {
            const { email, password } = request.body

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
                throw new UnauthorizedError("Invalid email or password")
            }

            const isPasswordValid = await bcrypt.compare(password, user.saltedPasswordHash)

            if (!isPasswordValid) {
                throw new UnauthorizedError("Invalid email or password")
            }

            const sessionId = SessionManager.createSession(String(user.id))
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
                sessionId,
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
                },
            },
        },
        async function (request, reply) {
            const token = extractTokenFromHeader(request.headers.authorization)
            const payload = verifyToken(token)

            SessionManager.removeSession(payload.userId)

            return {
                message: "Logout successful",
            }
        }
    )

    zodFastify.get(
        "/me",
        {
            schema: {
                headers: authHeadersSchema,
                response: {
                    200: meSuccessResponseSchema,
                },
            },
        },
        async function (request, reply) {
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
                throw new UnauthorizedError("User not found")
            }

            return {
                user: {
                    id: String(user.id),
                    email: user.email,
                    name: user.name,
                },
            }
        }
    )
}

// ============================================================================
// SCHEMA DEFINITIONS
// ============================================================================

const successResponseSchema = z.object({
    message: z.string(),
})

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
    sessionId: z.string(),
})

const logoutHeadersSchema = z.object({
    authorization: z.string().optional(),
})

const authHeadersSchema = z.object({
    authorization: z.string(),
})

const meSuccessResponseSchema = z.object({
    user: userSchema,
})

export default users
