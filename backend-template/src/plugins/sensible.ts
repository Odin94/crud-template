import fp from "fastify-plugin"
import sensible, { FastifySensibleOptions } from "@fastify/sensible"
import errorHandler from "../utils/errors"

/**
 * This plugins adds some utilities to handle http errors
 *
 * @see https://github.com/fastify/fastify-sensible
 */
export default fp<FastifySensibleOptions>(async (fastify) => {
    fastify.register(sensible).after(() => {
        // Must be added after sensible plugin registration
        fastify.setErrorHandler(errorHandler)
    })
})
