export interface AuthRequest {
    user?: UserData
}

export interface UserData {
    id: string,
    role: string,
    email: string
}