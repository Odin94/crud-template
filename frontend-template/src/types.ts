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
