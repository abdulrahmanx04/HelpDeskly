import {  Injectable } from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import {  UserData } from 'src/common/interfaces/all.interfaces';
import { TicketsServiceHelper } from './tickets.service.helper';
import { plainToInstance } from 'class-transformer';
import { TicketResponseDto } from './dto/ticket.dto';

@Injectable()
export class TicketsService {
  constructor
  (private ticketHelperService: TicketsServiceHelper){}

  async create(dto: CreateTicketDto, userData: UserData, files?: Express.Multer.File[]): Promise<TicketResponseDto> {
    const ticket= await this.ticketHelperService.createTicket(dto,userData,files)
    return plainToInstance(TicketResponseDto, ticket,{excludeExtraneousValues: true})
  } 

  findAll() {
    return `This action returns all tickets`;
  }

  findOne(id: number) {
    return `This action returns a #${id} ticket`;
  }

  update(id: number, updateTicketDto) {
    return `This action updates a #${id} ticket`;
  }

  remove(id: number) {
    return `This action removes a #${id} ticket`;
  }
}
