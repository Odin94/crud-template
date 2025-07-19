import { FastifyPluginAsync } from "fastify"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import { z } from "zod/v4"
import { extractTokenFromHeader, verifyToken } from "../utils/jwt"
import {
    getUserEvents,
    getSessionEvents,
    getUserEventsByType,
    getEventsInTimeRange,
    getEventStatistics,
    getAllEvents,
} from "../db/clickhouse_requests"
import { EventRecord } from "../db/clickhouse_schema"

const analytics: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
    const zodFastify = fastify.withTypeProvider<ZodTypeProvider>()

    zodFastify.get(
        "/analytics/events",
        {
            schema: {
                headers: authHeadersSchema,
                querystring: allEventsQuerySchema,
                response: {
                    200: eventsResponseSchema,
                },
            },
        },
        async function (request, reply) {
            const token = extractTokenFromHeader(request.headers.authorization)
            verifyToken(token)
            const { limit = 100, offset = 0 } = request.query

            try {
                const events = await getAllEvents(fastify, {
                    limit,
                    offset,
                })

                return {
                    events,
                    total: events.length,
                    limit,
                    offset,
                }
            } catch (error) {
                fastify.log.error(error, "Failed to fetch all events")
                throw error
            }
        }
    )

    zodFastify.get(
        "/analytics/my-events",
        {
            schema: {
                headers: authHeadersSchema,
                querystring: eventQuerySchema,
                response: {
                    200: eventsResponseSchema,
                },
            },
        },
        async function (request, reply) {
            const token = extractTokenFromHeader(request.headers.authorization)
            const payload = verifyToken(token)
            const { userId } = payload
            const { limit = 100, offset = 0, event_name } = request.query

            try {
                let events: EventRecord[]

                if (event_name) {
                    events = await getUserEventsByType(fastify, userId, event_name)
                } else {
                    events = await getUserEvents(fastify, userId)
                }

                const paginatedEvents = events.slice(offset, offset + limit)

                return {
                    events: paginatedEvents,
                    total: events.length,
                    limit,
                    offset,
                }
            } catch (error) {
                fastify.log.error(error, "Failed to fetch user events")
                throw error
            }
        }
    )

    zodFastify.get(
        "/analytics/session/:sessionId",
        {
            schema: {
                headers: authHeadersSchema,
                params: sessionParamsSchema,
                querystring: eventQuerySchema,
                response: {
                    200: eventsResponseSchema,
                },
            },
        },
        async function (request, reply) {
            const token = extractTokenFromHeader(request.headers.authorization)
            verifyToken(token) // Verify token but don't need payload for session queries
            const { sessionId } = request.params
            const { limit = 100, offset = 0, event_name } = request.query

            try {
                let events: EventRecord[]

                if (event_name) {
                    events = await getSessionEvents(fastify, sessionId)
                    events = events.filter((event) => event.event_name === event_name)
                } else {
                    events = await getSessionEvents(fastify, sessionId)
                }

                const paginatedEvents = events.slice(offset, offset + limit)

                return {
                    events: paginatedEvents,
                    total: events.length,
                    limit,
                    offset,
                }
            } catch (error) {
                fastify.log.error(error, "Failed to fetch session events")
                throw error
            }
        }
    )

    zodFastify.get(
        "/analytics/time-range",
        {
            schema: {
                headers: authHeadersSchema,
                querystring: timeRangeQuerySchema,
                response: {
                    200: eventsResponseSchema,
                },
            },
        },
        async function (request, reply) {
            const token = extractTokenFromHeader(request.headers.authorization)
            const payload = verifyToken(token)
            const { userId } = payload
            const { start_time, end_time, limit = 100, offset = 0 } = request.query

            try {
                const startTime = new Date(start_time)
                const endTime = new Date(end_time)

                if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
                    throw new Error("Invalid date format")
                }

                const events = await getEventsInTimeRange(fastify, userId, startTime, endTime)

                const paginatedEvents = events.slice(offset, offset + limit)

                return {
                    events: paginatedEvents,
                    total: events.length,
                    limit,
                    offset,
                }
            } catch (error) {
                fastify.log.error(error, "Failed to fetch events in time range")
                throw error
            }
        }
    )

    zodFastify.get(
        "/analytics/stats",
        {
            schema: {
                headers: authHeadersSchema,
                response: {
                    200: statsResponseSchema,
                },
            },
        },
        async function (request, reply) {
            const token = extractTokenFromHeader(request.headers.authorization)
            const payload = verifyToken(token)
            const { userId } = payload

            try {
                const stats = await getEventStatistics(fastify, userId)

                return {
                    totalEvents: stats.totalEvents,
                    uniqueEventTypes: stats.uniqueEventTypes,
                    mostFrequentEvent: stats.mostFrequentEvent,
                    eventBreakdown: stats.eventCounts,
                }
            } catch (error) {
                fastify.log.error(error, "Failed to fetch user statistics")
                throw error
            }
        }
    )
}

// ============================================================================
// SCHEMA DEFINITIONS
// ============================================================================

const authHeadersSchema = z.object({
    authorization: z.string(),
})

const sessionParamsSchema = z.object({
    sessionId: z.string().uuid("Invalid session ID format"),
})

const eventQuerySchema = z.object({
    limit: z
        .string()
        .transform((val) => parseInt(val))
        .pipe(z.number().min(1).max(1000))
        .optional(),
    offset: z
        .string()
        .transform((val) => parseInt(val))
        .pipe(z.number().min(0))
        .optional(),
    event_name: z.string().optional(),
})

const timeRangeQuerySchema = z.object({
    start_time: z.iso.datetime("Invalid start time format"),
    end_time: z.iso.datetime("Invalid end time format"),
    limit: z
        .string()
        .transform((val) => parseInt(val))
        .pipe(z.number().min(1).max(1000))
        .optional(),
    offset: z
        .string()
        .transform((val) => parseInt(val))
        .pipe(z.number().min(0))
        .optional(),
})

const allEventsQuerySchema = z.object({
    limit: z
        .string()
        .transform((val) => parseInt(val))
        .pipe(z.number().min(1).max(1000))
        .optional(),
    offset: z
        .string()
        .transform((val) => parseInt(val))
        .pipe(z.number().min(0))
        .optional(),
})

const eventsResponseSchema = z.object({
    events: z.array(
        z.object({
            session_id: z.string(),
            event_id: z.string(),
            user_id: z.string().optional(),
            event_name: z.string(),
            event_data: z.record(z.string(), z.any()),
            timestamp: z.date(),
        })
    ),
    total: z.number(),
    limit: z.number(),
    offset: z.number(),
})

const statsResponseSchema = z.object({
    totalEvents: z.number(),
    uniqueEventTypes: z.number(),
    mostFrequentEvent: z
        .object({
            name: z.string(),
            count: z.number(),
        })
        .nullable(),
    eventBreakdown: z.record(z.string(), z.number()),
})

export default analytics
