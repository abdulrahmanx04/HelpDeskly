import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UploadedFile, Put, UseInterceptors, HttpCode } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/common/guards/auth.guard';
import { CurrentUser } from 'src/common/decorators/current.user';
import type  { UserData } from 'src/common/interfaces/all.interfaces';
import { FileInterceptor } from '@nestjs/platform-express';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}



 

  @Get('me')
  findOne(@Param('id') id: string, @CurrentUser() userData: UserData) {
    return this.usersService.findOne(id,userData);
  }

  @UseInterceptors(FileInterceptor('avatar'))
  @Put('me')
  update (@Body()dto: UpdateUserDto, @CurrentUser() userData: UserData, @UploadedFile() file?: Express.Multer.File) {
    return this.usersService.update(dto,userData,file);
  }

  @Delete('me')
  @HttpCode(204)
  remove(@CurrentUser() userData: UserData) {
    return this.usersService.remove(userData);
  }
}
