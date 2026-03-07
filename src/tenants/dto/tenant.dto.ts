import { Expose, Type } from "class-transformer";
import { InviteStatus, MemberStatus, TenantLanguage, TenantMemberRole } from "src/common/enums/all.enums";
import { BusinessHoursDto, InviterData, TenantData, UserDto } from "./create-tenant.dto";


export class TenantResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  slug: string;

  @Expose()
  isActive: boolean;

  @Expose()
  logo: string;

  @Expose()
  supportEmail: string;

  @Expose()
  timezone: string;

  @Expose()
  language: TenantLanguage;

  @Expose()
  autoReplyMessage: string;

  @Expose()
  allowCustomerRegistration: boolean;

  @Expose()
  @Type(() => BusinessHoursDto)
  businessHours: BusinessHoursDto

  @Expose()
  plan: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}


export class InviteResponseDto {
  @Expose() id: string
  @Expose() email: string
  @Expose() status: InviteStatus
  @Expose() role: TenantMemberRole

  @Expose()
  @Type(() => TenantData)
  tenant: TenantData

  @Expose()
  @Type(() => InviterData)
  inviter: InviterData

  @Expose() expiresAt: Date
  @Expose() createdAt: Date

}

export class MemberResponseDto {
  @Expose()
  id: string;

  @Expose()
  role: TenantMemberRole;

  @Expose()
  status: MemberStatus;

  @Expose()
  @Type(() => UserDto)
  user: UserDto;

  @Expose()
  invitedBy?: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}




