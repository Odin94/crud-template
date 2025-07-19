import { FastifyReply, FastifyRequest } from "fastify"
import { ZodError } from "zod/v4"

export class UnauthorizedError extends Error {
    public statusCode = 401
    constructor(message = "Unauthorized") {
        super(message)
        this.name = "UnauthorizedError"
    }
}

export class ForbiddenError extends Error {
    public statusCode = 403
    constructor(message = "Forbidden") {
        super(message)
        this.name = "ForbiddenError"
    }
}

export class NotFoundError extends Error {
    public statusCode = 404
    constructor(message = "Not found") {
        super(message)
        this.name = "NotFoundError"
    }
}

export class ConflictError extends Error {
    public statusCode = 409
    constructor(message = "Conflict") {
        super(message)
        this.name = "ConflictError"
    }
}

export class ValidationError extends Error {
    public statusCode = 400
    constructor(message = "Validation error") {
        super(message)
        this.name = "ValidationError"
    }
}

export class InternalServerError extends Error {
    public statusCode = 500
    constructor(message = "Internal server error") {
        super(message)
        this.name = "InternalServerError"
    }
}

export const errorHandler = async (error: Error | ZodError, request: FastifyRequest, reply: FastifyReply) => {
    request.log.error(error)

    if (error instanceof UnauthorizedError) {
        reply.status(401)
        return {
            message: error.message,
        }
    }

    if (error instanceof ForbiddenError) {
        reply.status(403)
        return {
            message: error.message,
        }
    }

    if (error instanceof NotFoundError) {
        reply.status(404)
        return {
            message: error.message,
        }
    }

    if (error instanceof ConflictError) {
        reply.status(409)
        return {
            message: error.message,
        }
    }

    if (error instanceof ValidationError) {
        reply.status(400)
        return {
            message: error.message,
        }
    }

    if (error instanceof ZodError) {
        reply.status(400)
        return {
            message: "Validation error",
            details: error.issues,
        }
    }

    if (error instanceof InternalServerError) {
        reply.status(500)
        return {
            message: error.message,
        }
    }

    if (error.message.includes("token") || error.message.includes("authorization")) {
        reply.status(401)
        return {
            message: "Unauthorized: Invalid or missing token",
        }
    }

    request.log.error("-------------------------- I'm the error handler --------------------------")

    reply.status(500)
    return {
        message: "Internal server error",
    }
}
export default errorHandler
