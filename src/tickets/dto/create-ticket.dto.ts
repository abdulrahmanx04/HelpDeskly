import { Expose } from "class-transformer";
import { IsEnum, IsNotEmpty, IsOptional, IsUUID, Length } from "class-validator";
import { TicketPriority } from "src/common/enums/all.enums";


export class AttachmentDto {
    @Expose()
    fileName: string
     @Expose()
    url: string
     @Expose()
    publicId:string
     @Expose()
    mimeType: string
     @Expose()
    size: number
}
export class CreateTicketDto {
    @IsNotEmpty()
    @Length(1,100)
    subject: string
    
     @IsNotEmpty()
    @Length(20,5000)
    description: string

    @IsOptional()
    @IsEnum(TicketPriority)
    priority: TicketPriority
    
    @IsOptional()
    @IsUUID()
    categoryId?: string;

}
