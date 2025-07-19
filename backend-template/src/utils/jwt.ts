import jwt from "jsonwebtoken"
import { env } from "./env"
import { UnauthorizedError } from "./errors"

const JWT_SECRET = env.JWT_SECRET
const JWT_EXPIRES_IN = env.JWT_EXPIRES_IN

export interface JWTPayload {
    userId: string
    email: string
    name?: string
}

export function generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
    })
}

export function verifyToken(token: string): JWTPayload {
    try {
        return jwt.verify(token, JWT_SECRET) as JWTPayload
    } catch (error) {
        throw new UnauthorizedError("Invalid token")
    }
}

export function extractTokenFromHeader(authHeader: string | undefined): string {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new UnauthorizedError("No valid authorization token provided")
    }
    return authHeader.replace("Bearer ", "")
}
