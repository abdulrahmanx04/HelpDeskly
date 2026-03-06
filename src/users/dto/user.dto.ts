import { Expose } from "class-transformer";




export class UserResponseDto {
    @Expose() id: string

    @Expose()firstName: string;
        
    @Expose()lastName: string;
    @Expose()email: string

    @Expose() role: string
        
    @Expose()isOnline: boolean;
        
    @Expose() isVerified: boolean;
        
    @Expose()avatar: string;

    @Expose()createdAt: Date;

    @Expose()updatedAt: Date;
          
}