import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import {CreateTenantDto } from './dto/create-tenant.dto';
import { UserData } from 'src/common/interfaces/all.interfaces';
import { InjectRepository } from '@nestjs/typeorm';
import { Tenant } from './entities/tenant.entity';
import { Repository } from 'typeorm';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { UploadApiResponse } from 'cloudinary';
import {  MemberStatus, TenantMemberRole } from 'src/common/enums/all.enums';
import { User } from 'src/auth/entities/auth.entity';
import { DataSource } from 'typeorm';
import { AuthServiceHelper } from 'src/auth/auth.service.helper';
import { TenantMember } from 'src/members/entities/member.entity';
@Injectable()
export class TenantHelperService {
  constructor(
    @InjectRepository(Tenant) private tenantRepo: Repository<Tenant>,
    @InjectRepository(User) private userRepo: Repository<User>,
    private cloudinaryService: CloudinaryService,
    private dataSource: DataSource,
    private authHelperService: AuthServiceHelper
  ) { }

  async updateLogo(tenant: Tenant, file?: Express.Multer.File): Promise<void> {
    if (file) {
      if (tenant.logoPublicId) await this.cloudinaryService.deleteFile(tenant.logoPublicId)
      const upload = await this.cloudinaryService.uploadFile(file, 'logo') as UploadApiResponse
      tenant.logo = upload.secure_url
      tenant.logoPublicId = upload.public_id
    }
  }

  async isOwner(userData: UserData): Promise<Tenant> {
    const tenant = await this.tenantRepo.findOneOrFail({ where: { id: userData.tenantId } })
    if (tenant.ownerId !== userData.id) throw new BadRequestException('Cannot delete this company')
    if (tenant.logoPublicId) await this.cloudinaryService.deleteFile(tenant.logoPublicId)
    return tenant
  }

  async createTenant(dto: CreateTenantDto, userData: UserData) {
    const result = await this.dataSource.transaction(async (manager) => {
      const existSlug = await manager.findOne(Tenant, { where: { slug: dto.slug } })
      if (existSlug) throw new ConflictException('Company slug already used')
      const tenant = manager.create(Tenant, {
        name: dto.companyName,
        slug: dto.slug,
        ownerId: userData.id,
      })
      await manager.save(tenant)
      const membership = manager.create(TenantMember, {
        tenantId: tenant.id,
        userId: userData.id,
        role: TenantMemberRole.OWNER,
        status: MemberStatus.ACTIVE
      });
      await manager.save(membership)
      const user = await this.userRepo.findOne({
        where: { id: userData.id }
      });

      const { token } = this.authHelperService.signToken(user!, membership)
      return { tenant, token }
    })
    return result
  }
 
}
