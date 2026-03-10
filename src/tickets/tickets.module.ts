import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './entities/ticket.entity';
import { Category } from 'src/categories/entities/category.entity';
import { Message } from 'src/messages/entities/message.entity';
import { Attachment } from 'src/attachments/entities/attachment.entity';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { TicketsServiceHelper } from './tickets.service.helper';
import { Tenant } from 'src/tenants/entities/tenant.entity';
import { TenantMember } from 'src/members/entities/member.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket, Category, Message, Attachment,Tenant,TenantMember]),CloudinaryModule],
  controllers: [TicketsController],
  providers: [TicketsService,TicketsServiceHelper],
})
export class TicketsModule { }
