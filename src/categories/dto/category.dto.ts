import { Expose } from "class-transformer";


export class CategoryResponseDto {
    @Expose() id: string
    @Expose() name: string
    @Expose() description?: string
    @Expose() color?: string
    @Expose() isActive: boolean
    @Expose() createdAt?: Date
    @Expose() updatedAt?: Date
}

