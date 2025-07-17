import AutoLoad, { AutoloadPluginOptions } from "@fastify/autoload"
import { FastifyPluginAsync, FastifyServerOptions } from "fastify"
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod"
import { join } from "node:path"
import cors from "@fastify/cors"

export interface AppOptions extends FastifyServerOptions, Partial<AutoloadPluginOptions> {}
// Pass --options via CLI arguments in command to enable these options.
const options: AppOptions = {}

const app: FastifyPluginAsync<AppOptions> = async (fastify, opts): Promise<void> => {
    // Place here your custom code!

    // Configure zod type provider
    fastify.setValidatorCompiler(validatorCompiler)
    fastify.setSerializerCompiler(serializerCompiler)

    await fastify.register(cors, {})

    // Do not touch the following lines

    // This loads all plugins defined in plugins
    // those should be support plugins that are reused
    // through your application
    // eslint-disable-next-line no-void
    void fastify.register(AutoLoad, {
        dir: join(__dirname, "plugins"),
        options: opts,
    })

    // This loads all plugins defined in routes
    // define your routes in one of these
    // eslint-disable-next-line no-void
    void fastify.register(AutoLoad, {
        dir: join(__dirname, "routes"),
        options: opts,
    })
}

export default app
export { app, options }
