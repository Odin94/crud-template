import { FastifyPluginAsync } from "fastify"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import { z } from "zod/v4"

const root: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
    fastify.withTypeProvider<ZodTypeProvider>().get(
        "/",
        {
            schema: {
                response: {
                    200: z.object({
                        root: z.boolean(),
                        message: z.string(),
                        timestamp: z.string(),
                    }),
                },
            },
        },
        async function (request, reply) {
            return {
                root: true,
                message: "Welcome to the API with Zod validation!",
                timestamp: new Date().toISOString(),
            }
        }
    )
}

export default root
