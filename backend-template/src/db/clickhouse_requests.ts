import { FastifyInstance } from "fastify"
import { EventRecord, EVENTS_TABLE } from "../db/clickhouse_schema"
import { v4 as uuidv4 } from "uuid"
import { env } from "../utils/env"

const clickhouseDatabase = env.CLICKHOUSE_DATABASE

export async function recordEvent(fastify: FastifyInstance, eventName: string, userId: string | undefined, eventData: any): Promise<void> {
    const event = {
        session_id: uuidv4(),
        event_id: uuidv4(),
        user_id: userId,
        event_name: eventName,
        event_data: eventData,
        timestamp: Date.now(),
    }

    fastify.log.info({ timestampYXC: event.timestamp }, "Recording timestamp:" + event.timestamp)

    try {
        await fastify.clickhouse.client.insert({
            table: `${clickhouseDatabase}.${EVENTS_TABLE}`,
            values: [event],
            format: "JSONEachRow",
        })
        fastify.log.info(`✅ Event created successfully: ${event.event_id}`)
    } catch (error) {
        fastify.log.error(error, "❌ Failed to create event:")
    }
}

export async function getSessionEvents(fastify: FastifyInstance, sessionId: string): Promise<EventRecord[]> {
    try {
        const result = await fastify.clickhouse.client.query({
            query: `SELECT * FROM ${clickhouseDatabase}.${EVENTS_TABLE} WHERE session_id = {sessionId:String}`,
            format: "JSONEachRow",
            query_params: { sessionId },
        })

        const events = await result.json<EventRecord>()
        fastify.log.info(`✅ Found ${events.length} events for session ${sessionId}`)
        return events
    } catch (error) {
        fastify.log.error(error, "❌ Failed to get session events:")
        throw error
    }
}

export async function getUserEvents(fastify: FastifyInstance, userId: string): Promise<EventRecord[]> {
    try {
        const result = await fastify.clickhouse.client.query({
            query: `SELECT * FROM ${clickhouseDatabase}.${EVENTS_TABLE} WHERE user_id = {userId:String}`,
            format: "JSONEachRow",
            query_params: { userId },
        })
        const events = await result.json<EventRecord>()
        fastify.log.info(`✅ Found ${events.length} events for user ${userId}`)
        return events
    } catch (error) {
        fastify.log.error(error, "❌ Failed to get user events:")
        throw error
    }
}
