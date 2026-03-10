import { Expose, Type } from "class-transformer";
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator"
import { InviteStatus, TenantMemberRole } from "src/common/enums/all.enums"
import { TenantData } from "src/tenants/dto/create-tenant.dto";

export class InviteDto {
  @IsNotEmpty()
  @IsEmail()
  email: string


  @IsOptional()
  @IsEnum(TenantMemberRole)
  role?: TenantMemberRole

}

export  class AcceptInviteDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;

}
export class InviterData {
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
