import { Expose } from "class-transformer";
import { UserRole } from "src/common/enums/all.enums";




export class UserResponseDto {
    @Expose() id: string

    @Expose()firstName: string;
        
    @Expose()lastName: string;
    @Expose()email: string

    @Expose() role: UserRole
        
    @Expose()isOnline: boolean;
        
    @Expose() isVerified: boolean;
        
    @Expose()avatar: string;

    @Expose()createdAt: Date;

    @Expose()updatedAt: Date;
          
}