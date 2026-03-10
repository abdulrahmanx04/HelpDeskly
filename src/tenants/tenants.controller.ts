import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile, HttpCode, Put } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { CreateTenantDto,  UpdateTenantDto } from './dto/create-tenant.dto';
import { CurrentUser } from 'src/common/decorators/current.user';
import type { UserData } from 'src/common/interfaces/all.interfaces';
import { JwtAuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles';
import { FileInterceptor } from '@nestjs/platform-express';
import { TenantMemberRole } from 'src/common/enums/all.enums';
import { TenantsAccessGuard } from 'src/common/guards/tenants.roles.guard';



@Controller('tenants')
@UseGuards(JwtAuthGuard)
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) { }

  @Post('')
  createTenant(@Body() dto: CreateTenantDto, @CurrentUser() userData: UserData){
    return this.tenantsService.createTenant(dto,userData)
  }

  @UseGuards(TenantsAccessGuard)
  @Get()
  getOne(@CurrentUser() userData: UserData) {
    return this.tenantsService.getOne(userData)
  }

  @UseGuards(TenantsAccessGuard,RolesGuard)
  @Roles(TenantMemberRole.OWNER, TenantMemberRole.ADMIN)
  @UseInterceptors(FileInterceptor('logo'))
  @Put()
  update(@Body() dto: UpdateTenantDto, @CurrentUser() userData: UserData, @UploadedFile() file?: Express.Multer.File) {
    return this.tenantsService.update(dto, userData, file);
  }

  @UseGuards(TenantsAccessGuard,RolesGuard)
  @Roles(TenantMemberRole.OWNER)
  @Delete()
  @HttpCode(204)
  remove(@CurrentUser() userData: UserData) {
    return this.tenantsService.remove(userData);
  }
}



