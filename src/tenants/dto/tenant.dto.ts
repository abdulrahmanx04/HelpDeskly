import { Expose, Type } from "class-transformer";
import { InviteStatus, TenantLanguage, TenantMemberRole } from "src/common/enums/all.enums";
import { BusinessHoursDto } from "./update-tenant.dto";


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
class TenantData {
  @Expose() name: string
  @Expose() slug: string
}
class InviterData {
  @Expose() firstName: string
  @Expose() email: string
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






