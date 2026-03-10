export interface AuthRequest {
    user: UserData
}

export interface UserData {
    id: string,
    email: string,
    tenantId: string,
    tenantRole: string
}

export interface AttachmentInterface {
    fileName: string
    url: string
    publicId:string
    mimeType: string
    size: number
}