import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put, HttpCode } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/create-category.dto';
import { CurrentUser } from 'src/common/decorators/current.user';
import type { UserData } from 'src/common/interfaces/all.interfaces';
import { JwtAuthGuard } from 'src/common/guards/auth.guard';
import { TenantsAccessGuard } from 'src/common/guards/tenants.roles.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { TenantMemberRole } from 'src/common/enums/all.enums';
import { Roles } from 'src/common/decorators/roles';
import { Paginate } from 'nestjs-paginate';
import type { PaginateQuery } from 'nestjs-paginate';

@Controller('categories')
@UseGuards(JwtAuthGuard, TenantsAccessGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) { }

  @UseGuards(RolesGuard)
  @Roles(TenantMemberRole.ADMIN, TenantMemberRole.OWNER)
  @Post()
  create(@Body() dto: CreateCategoryDto, @CurrentUser() userData: UserData) {
    return this.categoriesService.create(dto, userData);
  }

  @Get()
  findAll(@Paginate() query: PaginateQuery,@CurrentUser() userData: UserData) {
    return this.categoriesService.findAll(query,userData);
  }

  @Get(':id')
  findOne(@Param('id') id: string,@CurrentUser() userData: UserData) {
    return this.categoriesService.findOne(id,userData);
  }

  @UseGuards(RolesGuard)
  @Roles(TenantMemberRole.ADMIN, TenantMemberRole.OWNER)
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto,@CurrentUser() userData: UserData) {
    return this.categoriesService.update(id, dto,userData);
  }

  @UseGuards(RolesGuard)
  @Roles(TenantMemberRole.ADMIN, TenantMemberRole.OWNER)
  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string,@CurrentUser() userData: UserData) {
    return this.categoriesService.remove(id,userData);
  }
}
