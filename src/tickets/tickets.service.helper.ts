import { Injectable, NotFoundException } from "@nestjs/common";
import { Ticket } from "./entities/ticket.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Attachment } from "src/attachments/entities/attachment.entity";
import { Category } from "src/categories/entities/category.entity";
import { Message } from "src/messages/entities/message.entity";
import { CloudinaryService } from "src/cloudinary/cloudinary.service";
import { AttachmentInterface, UserData } from "src/common/interfaces/all.interfaces";
import { CreateTicketDto } from "./dto/create-ticket.dto";
import { uploadFiles } from "src/common/utils/upload";




@Injectable()
export class TicketsServiceHelper {
    constructor
      (
      @InjectRepository(Ticket) private ticketRepo: Repository<Ticket>,
      @InjectRepository(Attachment) private attachmentRepo: Repository<Attachment>,
      @InjectRepository(Category) private categoryRepo: Repository<Category>,
      @InjectRepository(Message) private messageRepo: Repository<Message>,
      private cloudinaryService: CloudinaryService
    ){}

    async createTicket(dto: CreateTicketDto,userData: UserData,files?: Express.Multer.File[]): Promise<Ticket> {
        let attachmentFiles: AttachmentInterface[]  = []
        if (dto.categoryId) {
              const category = await this.categoryRepo.findOne({
                where: {
                  id: dto.categoryId,
                  tenantId: userData.tenantId,
                },
              });
              if (!category) {
                throw new NotFoundException('Category not found')
              }
        }
        if(files?.length) {
            attachmentFiles= await uploadFiles(this.cloudinaryService,'attachments',files)
        }
        const ticket= this.ticketRepo.create({
            ...dto,
            tenantId: userData.tenantId,
            customerId: userData.id,
            attachments: attachmentFiles.map((file: AttachmentInterface) => ({
            ...file,
            uploadedBy: userData.id
          }))
        }) 
       return  this.ticketRepo.save(ticket)
    }
}