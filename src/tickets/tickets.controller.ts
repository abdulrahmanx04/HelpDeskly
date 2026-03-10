import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { CurrentUser } from 'src/common/decorators/current.user';
import type { UserData } from 'src/common/interfaces/all.interfaces';
import { JwtAuthGuard } from 'src/common/guards/auth.guard';
import { TenantsAccessGuard } from 'src/common/guards/tenants.roles.guard';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('tickets')
@UseGuards(JwtAuthGuard,TenantsAccessGuard)
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) { }

  
  @UseInterceptors(FilesInterceptor('attachments',5))
  @Post()
  create(@Body() dto: CreateTicketDto,@CurrentUser() userData: UserData, @UploadedFiles() files?: Express.Multer.File[]) {
    return this.ticketsService.create(dto,userData,files)
  }

  @Get()
  findAll() {
    return this.ticketsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ticketsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTicketDto) {
    return this.ticketsService.update(+id, updateTicketDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ticketsService.remove(+id);
  }
}
