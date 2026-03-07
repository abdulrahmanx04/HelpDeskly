import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile, HttpCode, Put } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { AcceptInviteDto, UpdateMemberDto, UpdateTenantDto } from './dto/create-tenant.dto';
import { CurrentUser } from 'src/common/decorators/current.user';
import type { UserData } from 'src/common/interfaces/all.interfaces';
import { JwtAuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles';
import { FileInterceptor } from '@nestjs/platform-express';
import { TenantMemberRole } from 'src/common/enums/all.enums';
import { TenantsAccessGuard } from 'src/common/guards/tenants.roles.guard';
import { InviteDto } from './dto/create-tenant.dto';
import { Paginate } from 'nestjs-paginate';



@Controller('tenants/me')
@UseGuards(JwtAuthGuard, TenantsAccessGuard)
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) { }

  @Get()
  getOne(@CurrentUser() userData: UserData) {
    return this.tenantsService.getOne(userData)
  }

  @UseGuards(RolesGuard)
  @Roles(TenantMemberRole.OWNER, TenantMemberRole.ADMIN)
  @UseInterceptors(FileInterceptor('logo'))
  @Put()
  update(@Body() dto: UpdateTenantDto, @CurrentUser() userData: UserData, @UploadedFile() file?: Express.Multer.File) {
    return this.tenantsService.update(dto, userData, file);
  }

  @UseGuards(RolesGuard)
  @Roles(TenantMemberRole.OWNER)
  @Delete()
  @HttpCode(204)
  remove(@CurrentUser() userData: UserData) {
    return this.tenantsService.remove(userData);
  }

  @UseGuards(RolesGuard)
  @Roles(TenantMemberRole.OWNER, TenantMemberRole.ADMIN)
  @Post('invites')
  inviteUser(@Body() dto: InviteDto, @CurrentUser() userData: UserData) {
    return this.tenantsService.inviteUser(dto, userData)
  }

  @UseGuards(RolesGuard)
  @Roles(TenantMemberRole.OWNER, TenantMemberRole.ADMIN)
  @Get('invites')
  getInvites(@Paginate() query, @CurrentUser() userData: UserData) {
    return this.tenantsService.getInvites(query, userData)
  }


  @UseGuards(RolesGuard)
  @Roles(TenantMemberRole.OWNER, TenantMemberRole.ADMIN)
  @Delete('invites/:id')
  @HttpCode(204)
  revokeInvite(@Param('id') id: string, @CurrentUser() userData: UserData) {
    return this.tenantsService.revokeInvite(id, userData);
  }

  @Get('members')
  getMembers(@Paginate() query, @CurrentUser() userData: UserData) {
    return this.tenantsService.getMembers(query, userData)
  }

  @Get('members/:id')
  getMember(@Param('id') id: string, @CurrentUser() userData: UserData) {
    return this.tenantsService.getMember(id, userData)
  }

  @UseGuards(RolesGuard)
  @Roles(TenantMemberRole.OWNER, TenantMemberRole.ADMIN)
  @Put('members/:id')
  updateMemberRole(@Param('id') id: string, @Body() dto: UpdateMemberDto, @CurrentUser() userData: UserData
  ) {
    return this.tenantsService.updateMemberRole(id, dto, userData);
  }

  @UseGuards(RolesGuard)
  @Roles(TenantMemberRole.OWNER, TenantMemberRole.ADMIN)
  @Delete('members/:id')
  @HttpCode(204)
  removeMember(@Param('id') id: string, @CurrentUser() userData: UserData) {
    return this.tenantsService.removeMember(id, userData);
  }
}

@Controller('invites')
export class PublicInvitesController {
  constructor(private readonly tenantsService: TenantsService) { }

  @Get(':token')
  getInviteDetails(@Param('token') token: string) {
    return this.tenantsService.getInviteByToken(token);
  }

  @Post(':token/accept')
  acceptInvite(@Param('token') token: string, @Body() dto: AcceptInviteDto) {
    return this.tenantsService.acceptInvite(token, dto)
  }
}

