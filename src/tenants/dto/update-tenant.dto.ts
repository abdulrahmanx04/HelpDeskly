import {
  IsString,
  IsOptional,
  IsEmail,
  IsBoolean,
  ValidateNested,
  IsObject,
  Length,
  IsEnum,
  IsNotEmpty,
  MinLength,
} from 'class-validator';
import { Expose, Type } from 'class-transformer';
import { TenantLanguage, TenantMemberRole } from 'src/common/enums/all.enums';

class BusinessHoursDayDto {
  @Expose()
  @IsString()
  open: string;

  @Expose()
  @IsString()
  close: string;

  @Expose()
  @IsBoolean()
  enabled: boolean;
}

export class BusinessHoursDto {

  @Expose()
  @ValidateNested()
  @Type(() => BusinessHoursDayDto)
  saturday: BusinessHoursDayDto;

  @Expose()
  @ValidateNested()
  @Type(() => BusinessHoursDayDto)
  sunday: BusinessHoursDayDto;
  
  @Expose()
  @ValidateNested()
  @Type(() => BusinessHoursDayDto)
  monday: BusinessHoursDayDto;

  @Expose()
  @ValidateNested()
  @Type(() => BusinessHoursDayDto)
  tuesday: BusinessHoursDayDto;

  @Expose()
  @ValidateNested()
  @Type(() => BusinessHoursDayDto)
  wednesday: BusinessHoursDayDto;

  @Expose()
  @ValidateNested()
  @Type(() => BusinessHoursDayDto)
  thursday: BusinessHoursDayDto;

  @Expose()
  @ValidateNested()
  @Type(() => BusinessHoursDayDto)
  friday: BusinessHoursDayDto;

}

export class UpdateTenantDto {
  @IsOptional()
  @IsString()
  @Length(3, 50)
  name?: string;

  @IsOptional()
  @IsEmail()
  supportEmail?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsEnum(TenantLanguage)
  language?: TenantLanguage

  @IsOptional()
  @IsString()
  autoReplyMessage?: string;


  @IsOptional()
  @IsBoolean()
  allowCustomerRegistration?: boolean;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => BusinessHoursDto)
  businessHours?: BusinessHoursDto;
}

export class InviteDto {
  @IsNotEmpty()
  @IsEmail()
  email: string


  @IsOptional()
  @IsEnum(TenantMemberRole)
  role?: TenantMemberRole

}

export class AcceptInviteDto {
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


