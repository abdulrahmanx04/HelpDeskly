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
  Matches,
} from 'class-validator';
import { Expose, Type } from 'class-transformer';
import { TenantLanguage } from 'src/common/enums/all.enums';

export class BusinessHoursDayDto {
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
export class TenantData {
  @Expose() name: string
  @Expose() slug: string
}

export class UserDto {
  @Expose()
  id: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  email: string;

  @Expose()
  avatar?: string;
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
export class CreateTenantDto {
    @IsNotEmpty()
    @IsString()
    companyName: string;
    
    @IsNotEmpty()
    @IsString()
    @Matches(/^[a-z0-9-]+$/, {
      message: 'Slug can only contain lowercase letters, numbers, and dashes',
    })
    slug: string;
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




