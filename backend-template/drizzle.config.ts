import { defineConfig } from "drizzle-kit"
import { env } from "./src/utils/env"

export default defineConfig({
    out: "./migrations",
    schema: "./src/db/postgres_schema.ts",
    breakpoints: false,
    dialect: "postgresql",
    dbCredentials: {
        url: env.DATABASE_URL as string,
    },
})
