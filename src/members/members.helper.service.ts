import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { UserData } from 'src/common/interfaces/all.interfaces';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {   TenantMemberRole } from 'src/common/enums/all.enums';
import { FilterOperator, paginate,  PaginateQuery } from 'nestjs-paginate';
import { Tenant } from 'src/tenants/entities/tenant.entity';
import { TenantMember } from './entities/member.entity';
import { UpdateMemberDto } from './dto/update-member.dto';
@Injectable()
export class MemberHelperService {
  constructor(
    @InjectRepository(Tenant) private tenantRepo: Repository<Tenant>,
    @InjectRepository(TenantMember) private memberRepo: Repository<TenantMember>,
  ) { }
  
  async getMembers(query: PaginateQuery, userData: UserData) {
    const members = await paginate(query, this.memberRepo, {
      sortableColumns: ['createdAt', 'updatedAt', 'role', 'status'],
      searchableColumns: ['user.firstName', 'user.lastName', 'user.email'],
      filterableColumns: {
        role: [FilterOperator.EQ, FilterOperator.IN],
        status: [FilterOperator.EQ, FilterOperator.IN]
      },
      defaultLimit: 10,
      maxLimit: 100,
      defaultSortBy: [['createdAt', 'DESC']],
      relations: ['user'],
      where: {
        tenantId: userData.tenantId
      }
    });
    return members
  }
  async getMember(id: string, userData: UserData) {
    const member = await this.memberRepo.findOne({
      where: {
        id,
        tenantId: userData.tenantId
      },
      relations: ['user']
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }
    return member
  }

  async updateMemberRole(id: string, dto: UpdateMemberDto, userData: UserData) {
    const member = await this.memberRepo.findOne({
      where: {
        id,
        tenantId: userData.tenantId
      }
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    if (member.role === TenantMemberRole.OWNER) {
      throw new BadRequestException('Cannot change owner role');
    }

    if (dto.role === TenantMemberRole.OWNER) {
      throw new BadRequestException('Cannot promote member to owner');
    }

    if (member.userId === userData.id) {
      throw new BadRequestException('Cannot change your own role');
    }
    member.role = dto.role;
    return await this.memberRepo.save(member);
  }
  async removeMember(id: string, userData: UserData) {
    const member = await this.memberRepo.findOne({
      where: {
        id,
        tenantId: userData.tenantId
      }
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    if (member.role === TenantMemberRole.OWNER) {
      throw new BadRequestException('Cannot remove tenant owner');
    }

    if (member.userId === userData.id) {
      throw new BadRequestException('Cannot remove yourself');
    }
    await this.memberRepo.remove(member);
  }
}


