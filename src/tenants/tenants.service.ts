import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTenantDto,  UpdateTenantDto } from './dto/create-tenant.dto';
import { UserData } from 'src/common/interfaces/all.interfaces';
import { InjectRepository } from '@nestjs/typeorm';
import { Tenant } from './entities/tenant.entity';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { plainToInstance } from 'class-transformer';
import {  TenantResponseDto } from './dto/tenant.dto';
import { User } from 'src/auth/entities/auth.entity';
import { TenantHelperService } from './tenants.helper.service';
import { TenantMember } from 'src/members/entities/member.entity';



@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant) private tenantRepo: Repository<Tenant>,
    @InjectRepository(TenantMember) private memberRepo: Repository<TenantMember>,
    @InjectRepository(User) private userRepo: Repository<User>,
    private userServie: UsersService,
    private tenantHelperService: TenantHelperService
  ) { }


  async createTenant(dto: CreateTenantDto, userData: UserData): Promise<{ tenant: TenantResponseDto, token: string }> {
    const { tenant, token } = await this.tenantHelperService.createTenant(dto, userData)
    return {
      tenant: plainToInstance(TenantResponseDto, tenant, { excludeExtraneousValues: true }),
      token
    }
  }
  async getOne(userData: UserData): Promise<TenantResponseDto & { role: string }> {
    const [tenant, member] = await Promise.all([
      this.tenantRepo.findOne({ where: { id: userData.tenantId } }),
      this.memberRepo.findOneOrFail({ where: { tenantId: userData.tenantId, userId: userData.id } })
    ])
    return {
      ...plainToInstance(TenantResponseDto, tenant, { excludeExtraneousValues: true }),
      role: member?.role
    }
  }

  async update(dto: UpdateTenantDto, userData: UserData, file?: Express.Multer.File): Promise<TenantResponseDto> {
    const tenant = await this.tenantRepo.findOneOrFail({ where: { id: userData.tenantId } })
    this.userServie.checkFieldsForUpdate(dto, file)
    await this.tenantHelperService.updateLogo(tenant, file)
    await this.tenantRepo.save(this.tenantRepo.merge(tenant, dto))
    return plainToInstance(TenantResponseDto, tenant, { excludeExtraneousValues: true })
  }

  async remove(userData: UserData) {
    const tenant = await this.tenantHelperService.isOwner(userData)
    tenant.isActive = false
    await this.tenantRepo.save(tenant)
  }

 
}
