import { z } from "zod"
import dotenv from "dotenv"
import type { StringValue } from "ms"

dotenv.config({ quiet: true })

export const envSchema = z.object({
    DATABASE_URL: z.url("DATABASE_URL must be a valid URL"),

    JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters long"),
    JWT_EXPIRES_IN: z
        .string()
        .refine((val): val is StringValue => {
            const pattern =
                /^(\d+)(\s*)(Years?|Yrs?|Y|Weeks?|W|Days?|D|Hours?|Hrs?|Hr?|H|Minutes?|Mins?|Min?|M|Seconds?|Secs?|Sec?|s|Milliseconds?|Msecs?|Msec?|Ms)$/i
            return pattern.test(val)
        }, "JWT_EXPIRES_IN must be a valid time string (e.g., '7d', '24h', '30m')")
        .transform((val): StringValue => val as StringValue)
        .default("7d" as StringValue),

    PORT: z
        .string()
        .transform((val) => parseInt(val))
        .pipe(z.number().min(1).max(65535))
        .default(() => 3000),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

    CLICKHOUSE_URL: z.url().optional().default("http://localhost:8123"),
    CLICKHOUSE_USERNAME: z.string().default("default"),
    CLICKHOUSE_PASSWORD: z.string().default(""),
    CLICKHOUSE_DATABASE: z.string().default("default"),

    LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("debug"),
})

const parseEnv = () => {
    return envSchema.parse(process.env)
}

export const env = parseEnv()
export type Env = z.infer<typeof envSchema>
