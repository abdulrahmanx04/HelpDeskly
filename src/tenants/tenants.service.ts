import {  Injectable, NotFoundException } from '@nestjs/common';
import { AcceptInviteDto, UpdateTenantDto } from './dto/update-tenant.dto';
import { UserData } from 'src/common/interfaces/all.interfaces';
import { InjectRepository } from '@nestjs/typeorm';
import { Tenant } from './entities/tenant.entity';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { plainToInstance } from 'class-transformer';
import {  InviteResponseDto, TenantResponseDto } from './dto/tenant.dto';
import { InviteDto } from './dto/update-tenant.dto';
import { Invite } from './entities/invite.entity';
import { TenantMember } from './entities/tenant.member.entity';
import { User } from 'src/auth/entities/auth.entity';
import {  paginate,  PaginateQuery } from 'nestjs-paginate';
import { AuthServiceHelper } from 'src/auth/auth.service.helper';
import { TenantHelperService } from './tenants.helper.service';



@Injectable()
export class TenantsService {
  constructor(
  @InjectRepository(Tenant) private tenantRepo: Repository<Tenant>,
  @InjectRepository(TenantMember) private memberRepo: Repository<TenantMember>,
  @InjectRepository(Invite) private inviteRepo: Repository<Invite>,
  @InjectRepository(User) private userRepo: Repository<User>,
  private authHelperService: AuthServiceHelper,
  private userServie: UsersService,
  private tenantHelperService: TenantHelperService
){}

  

  async getOne(userData: UserData): Promise<TenantResponseDto & {role: string}>{

    const [tenant,member]= await Promise.all([
      this.tenantRepo.findOne({where: {id: userData.tenantId}}),
      this.memberRepo.findOneOrFail({where: {tenantId: userData.tenantId,userId: userData.id}})
    ])

    const response = plainToInstance(TenantResponseDto, tenant, { excludeExtraneousValues: true });

    return {
      ...response,
      role: member?.role
    }
  }
  
  async update(dto: UpdateTenantDto,userData: UserData,file?: Express.Multer.File): Promise<TenantResponseDto> {
    const tenant= await this.tenantRepo.findOneOrFail({where: {id: userData.tenantId}})
    this.userServie.checkFieldsForUpdate(dto,file)
    await this.tenantHelperService.updateLogo(tenant,file)
    await this.tenantRepo.save(this.tenantRepo.merge(tenant,dto))
    return plainToInstance(TenantResponseDto, tenant, {excludeExtraneousValues: true})
  }

  async remove(userData: UserData) {
    const tenant=await this.tenantHelperService.isOwner(userData)
    tenant.deletedAt= new Date()  
    tenant.isActive= false 
    await this.tenantRepo.save(tenant)
  }

  async inviteUser(dto: InviteDto,userData: UserData): Promise<InviteResponseDto>{
    let invite= await this.tenantHelperService.generateInvitationData(dto,userData)

    return plainToInstance(InviteResponseDto, invite, {excludeExtraneousValues: true})

  }


  async getInvites(query: PaginateQuery,userData: UserData): Promise<{meta: any,data: InviteResponseDto[]}> {
      const invites= await paginate(query,this.inviteRepo,this.tenantHelperService.invitesConfig(userData))
      const data = plainToInstance(InviteResponseDto,invites.data,{excludeExtraneousValues: true})
      return {
        ...invites,
        data
      }
  }

  async revokeInvite(inviteId: string, userData: UserData) {
     await this.tenantHelperService.checkAndRevokeInvite(inviteId,userData)
  }

  async getInviteByToken(token: string): Promise<{ tenantName:string,email: string,role: string,invitedBy: string,expiresAt: Date}>{
    const invite= await this.tenantHelperService.getInvite(token)
    return {
        tenantName: invite.tenant.name,
        email: invite.email,
        role: invite.role,
        invitedBy: `${invite.inviter.firstName} ${invite.inviter.lastName}`,
        expiresAt: invite.expiresAt
    };
  }

  async acceptInvite(urlToken: string,dto: AcceptInviteDto){

    const {user,member,invite}= await this.tenantHelperService.acceptAndUpdateInvite(urlToken,dto)    

    const token = this.authHelperService.signToken(user,member)
   
    await Promise.all([this.memberRepo.save(member),this.inviteRepo.save(invite)])
    return token

  }


  
}
