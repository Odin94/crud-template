import fp from "fastify-plugin"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { FastifyPluginAsync } from "fastify"
import { env } from "../utils/env"

const connectionString = env.DATABASE_URL

const drizzlePlugin: FastifyPluginAsync = async (fastify) => {
    const client = postgres(connectionString)
    const db = drizzle(client)
    fastify.decorate("db", db)
}

export default fp(drizzlePlugin)

declare module "fastify" {
    interface FastifyInstance {
        db: ReturnType<typeof drizzle>
    }
}
