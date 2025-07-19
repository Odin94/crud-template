export type User = {
    id: string
    name: string
    email: string
}

export type UsersResponse = {
    users: User[]
}

export type LoginResponse = {
    user: User
    token: string
}

export type EventRecord = {
    session_id: string
    event_id: string
    user_id?: string
    event_name: string
    event_data: Record<string, unknown>
    timestamp: string
}

export type EventsResponse = {
    events: EventRecord[]
    total: number
    limit: number
    offset: number
}
