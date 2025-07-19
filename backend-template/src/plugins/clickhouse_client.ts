import fp from "fastify-plugin"
import { FastifyPluginAsync } from "fastify"
import { createClient } from "@clickhouse/client"
import { env } from "../utils/env"
import { EVENTS_TABLE, CREATE_DATABASE_SQL, CREATE_EVENTS_TABLE_SQL } from "../db/clickhouse_schema"

const clickhouseUrl = env.CLICKHOUSE_URL
const clickhouseUser = env.CLICKHOUSE_USERNAME
const clickhousePassword = env.CLICKHOUSE_PASSWORD
const clickhouseDatabase = env.CLICKHOUSE_DATABASE

async function initializeClickHouseDatabase(client: ReturnType<typeof createClient>, log: any): Promise<void> {
    try {
        await client.exec({
            query: CREATE_DATABASE_SQL(clickhouseDatabase),
        })
        log.info(`✅ ClickHouse database '${clickhouseDatabase}' is ready`)

        await client.exec({
            query: CREATE_EVENTS_TABLE_SQL(clickhouseDatabase),
        })
        log.info(`✅ ClickHouse table '${EVENTS_TABLE}' is ready`)
    } catch (error) {
        log.error("❌ Failed to initialize ClickHouse database:", error)
        throw error
    }
}

const clickhousePlugin: FastifyPluginAsync = async (fastify) => {
    const client = createClient({
        url: clickhouseUrl,
        username: clickhouseUser,
        password: clickhousePassword,
        database: clickhouseDatabase,
    })

    await initializeClickHouseDatabase(client, fastify.log)

    fastify.decorate("clickhouse", {
        client,
    })
}

declare module "fastify" {
    interface FastifyInstance {
        clickhouse: {
            client: ReturnType<typeof createClient>
        }
    }
}

export default fp(clickhousePlugin)
