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
            query: `SELECT * FROM ${clickhouseDatabase}.${EVENTS_TABLE} WHERE user_id = {userId:String} ORDER BY timestamp DESC`,
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

export async function getUserEventsByType(fastify: FastifyInstance, userId: string, eventName: string): Promise<EventRecord[]> {
    try {
        const result = await fastify.clickhouse.client.query({
            query: `SELECT * FROM ${clickhouseDatabase}.${EVENTS_TABLE} WHERE user_id = {userId:String} AND event_name = {eventName:String} ORDER BY timestamp DESC`,
            format: "JSONEachRow",
            query_params: { userId, eventName },
        })
        const events = await result.json<EventRecord>()
        fastify.log.info(`✅ Found ${events.length} ${eventName} events for user ${userId}`)
        return events
    } catch (error) {
        fastify.log.error(error, "❌ Failed to get user events by type:")
        throw error
    }
}

export async function getEventsInTimeRange(
    fastify: FastifyInstance,
    userId: string,
    startTime: Date,
    endTime: Date
): Promise<EventRecord[]> {
    try {
        const result = await fastify.clickhouse.client.query({
            query: `SELECT * FROM ${clickhouseDatabase}.${EVENTS_TABLE} WHERE user_id = {userId:String} AND timestamp >= {startTime:DateTime64(3)} AND timestamp <= {endTime:DateTime64(3)} ORDER BY timestamp DESC`,
            format: "JSONEachRow",
            query_params: { userId, startTime: startTime.toISOString(), endTime: endTime.toISOString() },
        })
        const events = await result.json<EventRecord>()
        fastify.log.info(`✅ Found ${events.length} events for user ${userId} in time range`)
        return events
    } catch (error) {
        fastify.log.error(error, "❌ Failed to get events in time range:")
        throw error
    }
}

export async function getEventStatistics(
    fastify: FastifyInstance,
    userId: string
): Promise<{
    totalEvents: number
    eventCounts: Record<string, number>
    uniqueEventTypes: number
    mostFrequentEvent: { name: string; count: number } | null
}> {
    try {
        const result = await fastify.clickhouse.client.query({
            query: `
                SELECT 
                    event_name,
                    count() as count
                FROM ${clickhouseDatabase}.${EVENTS_TABLE} 
                WHERE user_id = {userId:String}
                GROUP BY event_name
                ORDER BY count DESC
            `,
            format: "JSONEachRow",
            query_params: { userId },
        })

        const eventCounts = await result.json<{ event_name: string; count: number }>()

        const totalEvents = eventCounts.reduce((sum, item) => sum + Number(item.count), 0)
        const uniqueEventTypes = eventCounts.length
        const mostFrequentEvent =
            eventCounts.length > 0
                ? {
                      name: eventCounts[0].event_name,
                      count: Number(eventCounts[0].count),
                  }
                : null

        const eventCountsMap = eventCounts.reduce((acc, item) => {
            acc[item.event_name] = Number(item.count)
            return acc
        }, {} as Record<string, number>)

        return {
            totalEvents,
            eventCounts: eventCountsMap,
            uniqueEventTypes,
            mostFrequentEvent,
        }
    } catch (error) {
        fastify.log.error(error, "❌ Failed to get event statistics:")
        throw error
    }
}

export async function getAllEvents(
    fastify: FastifyInstance,
    options?: {
        limit?: number
        offset?: number
    }
): Promise<EventRecord[]> {
    try {
        let query = `SELECT * FROM ${clickhouseDatabase}.${EVENTS_TABLE} ORDER BY timestamp DESC`
        const queryParams: Record<string, string> = {}

        if (options?.limit) {
            query += ` LIMIT {limit:UInt32}`
            queryParams.limit = options.limit.toString()
        }

        if (options?.offset) {
            query += ` OFFSET {offset:UInt32}`
            queryParams.offset = options.offset.toString()
        }

        const result = await fastify.clickhouse.client.query({
            query,
            format: "JSONEachRow",
            query_params: queryParams,
        })

        const events = await result.json<EventRecord>()
        fastify.log.info(`✅ Found ${events.length} events`)
        return events
    } catch (error) {
        fastify.log.error(error, "❌ Failed to get all events:")
        throw error
    }
}
