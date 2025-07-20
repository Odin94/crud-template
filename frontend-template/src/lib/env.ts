import { z } from "zod"

const envSchema = z.object({
    API_BASE_URL: z.url("API_BASE_URL must be a valid URL").default("http://localhost:3000"),
})

type Env = z.infer<typeof envSchema>

function validateEnv(): Env {
    const env = {
        API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    }

    try {
        return envSchema.parse(env)
    } catch (error) {
        if (error instanceof z.ZodError) {
            const missingVars = error.issues.map((issue) => issue.path.join("."))
            throw new Error(
                `Missing or invalid environment variables: ${missingVars.join(", ")}\n` +
                    "Please check your .env file and ensure all required variables are set."
            )
        }
        throw error
    }
}

export const env = validateEnv()
