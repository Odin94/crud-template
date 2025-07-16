import fp from "fastify-plugin"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { FastifyPluginAsync } from "fastify"

import * as dotenv from "dotenv"
dotenv.config()

const connectionString = process.env.DATABASE_URL || "postgres://template_user:template_password@localhost:5432/template_db"

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
