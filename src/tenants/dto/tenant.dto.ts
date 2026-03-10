import { Expose, Type } from "class-transformer";
import {  TenantLanguage } from "src/common/enums/all.enums";
import { BusinessHoursDto    } from "./create-tenant.dto";

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







