import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { UserData } from 'src/common/interfaces/all.interfaces';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invite } from './entities/invite.entity';
import { InviteStatus,  TenantMemberRole } from 'src/common/enums/all.enums';
import * as crypto from 'crypto'
import { v4 as uuid } from 'uuid'
import { sendEmail } from 'src/common/utils/email';
import { User } from 'src/auth/entities/auth.entity';
import { FilterOperator,  PaginateConfig } from 'nestjs-paginate';
import { Tenant } from 'src/tenants/entities/tenant.entity';
import { AcceptInviteDto, InviteDto } from './dto/create-invite.dto';
import { TenantMember } from 'src/members/entities/member.entity';

@Injectable()
export class InviteHelperService {
  constructor(
    @InjectRepository(Tenant) private tenantRepo: Repository<Tenant>,
    @InjectRepository(TenantMember) private memberRepo: Repository<TenantMember>,
    @InjectRepository(Invite) private inviteRepo: Repository<Invite>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) { }

  async generateInvitationData(dto: InviteDto, userData: UserData): Promise<Invite> {
    await this.checkInvitationPerms(dto, userData)
    let token = uuid()
    let hashed = crypto.createHash('sha256').update(token).digest('hex')
    let url = `${process.env.FRONTEND_URL}/invites/${token}/accept`
    const invite = this.inviteRepo.create({
      email: dto.email,
      tenantId: userData.tenantId,
      token: hashed,
      invitedBy: userData.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    })

    const [inviter, tenant] = await Promise.all([
      this.userRepo.findOne({ where: { id: userData.id } }),
      this.tenantRepo.findOne({ where: { id: userData.tenantId } }),
      this.inviteRepo.save(invite)
    ])
    const [inviteDetails] = await Promise.all([
      this.inviteRepo.findOneOrFail({ where: { id: invite.id }, relations: ['inviter', 'tenant'] }),
      await sendEmail('invite', dto.email, url, tenant?.name, inviter?.firstName, invite.role)
    ])
    return inviteDetails
  }


  async checkInvitationPerms(dto: InviteDto, userData: UserData): Promise<void> {
    if (dto.role == TenantMemberRole.OWNER) throw new BadRequestException('Cannot invite user as admin or owner')
    const alreadyMember = await this.memberRepo.findOne({ where: { user: { email: dto.email }, tenantId: userData.tenantId }, relations: ['user'] })

    if (alreadyMember) {
      throw new ConflictException('User is already a member in this company')
    }
    const pendingInvite = await this.inviteRepo.findOne({ where: { email: dto.email, tenantId: userData.tenantId, status: InviteStatus.PENDING } })

    if (pendingInvite) throw new ConflictException('Invite for this user already exists')
  }

  invitesConfig(userData: UserData): PaginateConfig<Invite> {
    const invitesConfig: PaginateConfig<Invite> = {
      sortableColumns: ['createdAt', 'expiresAt', 'status', 'role'],
      searchableColumns: ['email', 'inviter.firstName', 'inviter.lastName'],
      filterableColumns: {
        status: [FilterOperator.IN],
        role: [FilterOperator.EQ],
        email: [FilterOperator.ILIKE]
      },
      defaultLimit: 10,
      maxLimit: 100,
      defaultSortBy: [['createdAt', 'DESC']],
      relations: ['inviter', 'tenant'],
      where: { tenantId: userData.tenantId }
    }
    return invitesConfig
  }

  async checkAndRevokeInvite(inviteId: string, userData: UserData) {
    const invite = await this.inviteRepo.findOne({
      where: {
        id: inviteId,
        tenantId: userData.tenantId
      }
    });

    if (!invite) {
      throw new NotFoundException('Invite not found');
    }

    if (invite.status !== InviteStatus.PENDING) {
      throw new BadRequestException('Only pending invites can be revoked');
    }

    invite.status = InviteStatus.REVOKED;
    invite.revokedBy = userData.id
    await this.inviteRepo.remove(invite);
  }

  async getInvite(token: string): Promise<Invite> {
    const hashed = crypto.createHash('sha256').update(token).digest('hex')
    const invite = await this.inviteRepo.findOne({
      where: {
        token: hashed
      }, relations: ['inviter', 'tenant']
    })
    if (!invite) throw new NotFoundException('Invite not found')
    if (!invite.canBeAccpeted()) {
      if (invite.isExpired()) {
        invite.status = InviteStatus.EXPIRED
        await this.inviteRepo.save(invite)
        throw new BadRequestException('Invite has expired');
      }
      throw new BadRequestException('Invite is no longer valid');
    }
    return invite
  }
  async acceptAndUpdateInvite(urlToken: string, dto: AcceptInviteDto): Promise<{ user: User, member: TenantMember, invite: Invite }> {
      const hashed = crypto.createHash('sha256').update(urlToken).digest('hex')
      const invite = await this.inviteRepo.findOne({ where: { token: hashed } })
      if (!invite) throw new NotFoundException('Invite not found')
      if (!invite.canBeAccpeted()) throw new BadRequestException('Invite is no longer valid')

      let user = await this.userRepo.findOne({ where: { email: invite.email } })

      if (user) {
        const existingMember = await this.memberRepo.findOne({ where: { userId: user.id, tenantId: invite.tenantId } })
        if (existingMember) {
          throw new ConflictException('User is already a member of this tenant');
        }
      } else {
        const newUser = this.userRepo.create({
          ...dto,
          email: invite.email,
          isVerified: true
        })
        user = await this.userRepo.save(newUser)
      }
      const member = this.memberRepo.create({
        userId: user.id,
        tenantId: invite.tenantId,
        role: invite.role
      })
      invite.status = InviteStatus.ACCEPTED
      invite.acceptedAt = new Date()
      invite.acceptedBy = user.id
      return { user, member, invite }
  }
 
 
}
