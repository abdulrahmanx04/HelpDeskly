import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { AuthRequest } from "../interfaces/all.interfaces";
import { InjectRepository } from "@nestjs/typeorm";
import { Tenant } from "src/tenants/entities/tenant.entity";
import { Repository } from "typeorm";
import { MemberStatus } from "../enums/all.enums";
import { TenantMember } from "src/members/entities/member.entity";


@Injectable()
export class TenantsAccessGuard implements CanActivate {
    constructor(
    @InjectRepository(Tenant) private tenantRepo: Repository<Tenant>,
    @InjectRepository(TenantMember)  private memberRepo: Repository<TenantMember>
){}
   async canActivate(context: ExecutionContext) {
    const req= context.switchToHttp().getRequest<AuthRequest>()
    const user= req.user
    const tenant = await this.tenantRepo.findOne({ where: { id: user.tenantId, isActive: true }});
    if (!tenant) throw new ForbiddenException('Company not found or inactive');

    const member = await this.memberRepo.findOne({
      where: { tenantId: user.tenantId, userId: user.id, status: MemberStatus.ACTIVE },
    });
    if (!member) throw new ForbiddenException('Not an active member of this company');
    return true;
 }
}