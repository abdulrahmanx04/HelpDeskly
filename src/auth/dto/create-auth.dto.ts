
import { IsEmail, IsString, MinLength, Matches, IsOptional, IsEnum, IsNotEmpty } from 'class-validator';

export class RegisterTenantDto {
  @IsNotEmpty()
  @IsString()
  companyName: string;
  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug can only contain lowercase letters, numbers, and dashes',
  })
  slug: string;

  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;
}


export class LoginDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  slug: string;
}


export class EmailDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;



}

export class ResetPasswordDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;
}


export class ChangePasswordDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  currentPassword: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  newPassword: string
}





