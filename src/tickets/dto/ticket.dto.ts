import { AttachmentDto, CreateTicketDto } from './create-ticket.dto';
import { Expose, Type } from 'class-transformer';



export class TicketResponseDto {
    @Expose() id: string
    @Expose() subject: string
    @Expose() description: string
    @Expose() status: string
    @Expose() priority: string

    @Expose()
    @Type(() => AttachmentDto)
    attachments: AttachmentDto[]
}