import { Body, Controller, Delete, Get, HttpCode, Param, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/common/guards/auth.guard";
import { TenantsAccessGuard } from "src/common/guards/tenants.roles.guard";
import { TenantMemberRole } from "src/common/enums/all.enums";
import { Roles } from "src/common/decorators/roles";
import { RolesGuard } from "src/common/guards/roles.guard";
import { CurrentUser } from "src/common/decorators/current.user";
import type { UserData } from "src/common/interfaces/all.interfaces";
import { Paginate } from "nestjs-paginate";
import type { PaginateQuery } from "nestjs-paginate";
import { AcceptInviteDto, InviteDto } from "./dto/create-invite.dto";
import { InvitesService } from "./invites.service";


@Controller('invites')
@UseGuards(JwtAuthGuard, TenantsAccessGuard,RolesGuard)
@Roles(TenantMemberRole.ADMIN, TenantMemberRole.OWNER)
export class InvitesController {
  constructor(private readonly inviteService: InvitesService) {}

  @Post()
  inviteUser(@Body() dto: InviteDto, @CurrentUser() userData: UserData) {
    return this.inviteService.inviteUser(dto, userData);
  }

  @Get()
  getInvites(
    @Paginate() query: PaginateQuery,
    @CurrentUser() userData: UserData,
  ) {
    return this.inviteService.getInvites(query, userData);
  }
  

  @Delete(':id')
  @HttpCode(204)
  revokeInvite(@Param('id') id: string, @CurrentUser() userData: UserData) {
    return this.inviteService.revokeInvite(id, userData);
  }
}

@Controller('invites')
export class PublicInvitesController {
   constructor(private readonly inviteService: InvitesService) {}

  @Get(':token')
  getInviteDetails(@Param('token') token: string) {
    return this.inviteService.getInviteByToken(token)
  }

  @Post(':token/accept')
  acceptInvite(@Param('token') token: string, @Body() dto: AcceptInviteDto) {
    return this.inviteService.acceptInvite(token, dto)
  }
}