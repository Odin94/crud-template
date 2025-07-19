import { v4 as uuidv4 } from "uuid"

interface Session {
    sessionId: string
    expiresAt: Date
}

export const SessionManager = {
    sessions: new Map<string, Session>(),

    createSession(userId: string, expiresInHours: number = 12): string {
        const sessionId = uuidv4()
        const expiresAt = new Date()
        expiresAt.setHours(expiresAt.getHours() + expiresInHours)

        this.sessions.set(userId, {
            sessionId,
            expiresAt,
        })

        return sessionId
    },

    getSession(userId: string): Session | undefined {
        const session = this.sessions.get(userId)
        if (!session) return undefined

        if (session.expiresAt < new Date()) {
            this.sessions.delete(userId)
            return undefined
        }

        return session
    },

    removeSession(userId: string): boolean {
        return this.sessions.delete(userId)
    },

    cleanupExpiredSessions(): void {
        const now = new Date()
        for (const [userId, session] of this.sessions.entries()) {
            if (session.expiresAt < now) {
                this.sessions.delete(userId)
            }
        }
    },
}
