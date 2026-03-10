import { Controller,UseGuards,Get,Param, Patch, Body, Delete, HttpCode } from "@nestjs/common";
import { JwtAuthGuard } from "src/common/guards/auth.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { TenantsAccessGuard } from "src/common/guards/tenants.roles.guard";
import type { PaginateQuery } from "nestjs-paginate";
import { CurrentUser } from "src/common/decorators/current.user";
import type { UserData } from "src/common/interfaces/all.interfaces";
import { Paginate } from "nestjs-paginate";
import { TenantMemberRole } from "src/common/enums/all.enums";
import { Roles } from "src/common/decorators/roles";
import { UpdateMemberDto } from "./dto/update-member.dto";
import { MembersService } from "./members.service";


@Controller('members')
@UseGuards(JwtAuthGuard, TenantsAccessGuard)
export class MembersController {
  constructor(private readonly memberService: MembersService) {}

  @Get()
  getMembers(
    @Paginate() query: PaginateQuery,
    @CurrentUser() userData: UserData,
  ) {
    return this.memberService.getMembers(query, userData);
  }

  @Get(':id')
  getMember(@Param('id') id: string, @CurrentUser() userData: UserData) {
    return this.memberService.getMember(id, userData);
  }

  @UseGuards(RolesGuard)
  @Roles(TenantMemberRole.ADMIN, TenantMemberRole.OWNER)
  @Patch(':id')
  updateMember(
    @Param('id') id: string,
    @Body() dto: UpdateMemberDto,
    @CurrentUser() userData: UserData,
  ) {
    return this.memberService.updateMemberRole(id, dto, userData);
  }

  @UseGuards(RolesGuard)
  @Roles(TenantMemberRole.ADMIN, TenantMemberRole.OWNER)
  @Delete(':id')
  @HttpCode(204)
  removeMember(@Param('id') id: string, @CurrentUser() userData: UserData) {
    return this.memberService.removeMember(id, userData);
  }
}