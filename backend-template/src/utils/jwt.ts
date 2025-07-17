import jwt from "jsonwebtoken"
import type { StringValue } from "ms"

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production"
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || "10h") as StringValue

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
        throw new Error("Invalid token")
    }
}

export function extractTokenFromHeader(authHeader: string | undefined): string {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new Error("No valid authorization token provided")
    }
    return authHeader.replace("Bearer ", "")
}
