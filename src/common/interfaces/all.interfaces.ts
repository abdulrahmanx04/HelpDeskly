export interface AuthRequest {
    user: UserData
}

export interface UserData {
    id: string,
    email: string,
    tenantId: string,
    tenantRole: string
}