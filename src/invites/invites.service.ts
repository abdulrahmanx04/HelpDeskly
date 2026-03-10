import { Injectable, NotFoundException } from '@nestjs/common';
import { UserData } from 'src/common/interfaces/all.interfaces';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { plainToInstance } from 'class-transformer';
import { Invite } from './entities/invite.entity';
import { User } from 'src/auth/entities/auth.entity';
import { paginate, PaginateQuery } from 'nestjs-paginate';
import { AuthServiceHelper } from 'src/auth/auth.service.helper';
import { Tenant } from 'src/tenants/entities/tenant.entity';
import { AcceptInviteDto, InviteDto } from './dto/create-invite.dto';
import { InviteHelperService } from './invites.service.helepr';
import { InviteResponseDto } from './dto/create-invite.dto';
import { TenantMember } from 'src/members/entities/member.entity';


@Injectable()
export class InvitesService {
  constructor(
    @InjectRepository(TenantMember) private memberRepo: Repository<TenantMember>,
    @InjectRepository(Invite) private inviteRepo: Repository<Invite>,
    @InjectRepository(User) private userRepo: Repository<User>,
    private authHelperService: AuthServiceHelper,
    private inviteHelperService: InviteHelperService
  ) { }
 

  async inviteUser(dto: InviteDto, userData: UserData): Promise<InviteResponseDto> {
    const invite = await this.inviteHelperService.generateInvitationData(dto, userData)
    return plainToInstance(InviteResponseDto, invite, { excludeExtraneousValues: true })

  }

  async getInvites(query: PaginateQuery, userData: UserData): Promise<{ meta: any, data: InviteResponseDto[] }> {
    const invites = await paginate(query, this.inviteRepo, this.inviteHelperService.invitesConfig(userData))
    return {
      ...invites,
      data: plainToInstance(InviteResponseDto, invites.data, { excludeExtraneousValues: true })
    }
  }

  async revokeInvite(inviteId: string, userData: UserData) {
    await this.inviteHelperService.checkAndRevokeInvite(inviteId, userData)
  }

  async getInviteByToken(token: string): Promise<{ tenantName: string, email: string, role: string, invitedBy: string, expiresAt: Date }> {
    const invite = await this.inviteHelperService.getInvite(token)
    return {
      tenantName: invite.tenant.name,
      email: invite.email,
      role: invite.role,
      invitedBy: `${invite.inviter.firstName} ${invite.inviter.lastName}`,
      expiresAt: invite.expiresAt
    }
  }

  async acceptInvite(urlToken: string, dto: AcceptInviteDto) {

    const { user, member, invite } = await this.inviteHelperService.acceptAndUpdateInvite(urlToken, dto)

    const token = this.authHelperService.signToken(user, member)

    await Promise.all([this.memberRepo.save(member), this.inviteRepo.save(invite)])
    return token

  }
  
}
