import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './entities/ticket.entity';
import { Category } from 'src/categories/entities/category.entity';
import { Message } from 'src/messages/entities/message.entity';
import { Attachment } from 'src/attachments/entities/attachment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket, Category, Message, Attachment])],
  controllers: [TicketsController],
  providers: [TicketsService],
})
export class TicketsModule { }
