import { z } from "zod"

export const EVENTS_TABLE = "events"

export type EventRecord = z.infer<typeof eventRecordSchema>

export const eventRecordSchema = z.object({
    session_id: z.uuid("Invalid session ID format"),
    event_id: z.uuid("Invalid event ID format"),
    user_id: z.uuid("Invalid user ID format").optional(),
    event_name: z.string("Invalid event name format"),
    event_data: z.record(z.string(), z.any()),
    timestamp: z.date(),
})

export const CREATE_DATABASE_SQL = (databaseName: string) => `
CREATE DATABASE IF NOT EXISTS ${databaseName}
`

export const CREATE_EVENTS_TABLE_SQL = (databaseName: string) => `
CREATE TABLE IF NOT EXISTS ${databaseName}.${EVENTS_TABLE} (
    session_id UUID NOT NULL,
    event_id UUID NOT NULL,
    user_id UUID NULL,
    event_name String NOT NULL,
    event_data JSON NOT NULL,
    timestamp DateTime64(3) DEFAULT now()
) ENGINE = MergeTree()
ORDER BY (session_id, event_id)
`
