import { Injectable } from '@nestjs/common';
import { ChangePasswordDto, EmailDto, LoginDto, RegisterTenantDto, ResetPasswordDto } from './dto/create-auth.dto';
import { UserData } from 'src/common/interfaces/all.interfaces';
import { AuthServiceHelper } from './auth.service.helper';
import { Tenant } from 'src/tenants/entities/tenant.entity';
import { User } from './entities/auth.entity';
import { TenantMember } from 'src/tenants/entities/tenant.member.entity';
@Injectable()
export class AuthService {
  constructor(private authHelper: AuthServiceHelper) { }
  
  async registerAdminTenant(dto: RegisterTenantDto): Promise<{token: string}> {
    await this.authHelper.tenantExists(dto.slug) 
    const result = await this.authHelper.registerAdminAndTenant(dto)
    return this.authHelper.signToken(result.admin,result.membership)
  }

  async login(dto: LoginDto): Promise<{token: string}> {
    const tenant = await this.authHelper.tenantValidation(dto.slug) 
    const {user,tenantMember} = await this.authHelper.authBeforeLogin(dto, tenant.id) 
    return this.authHelper.signToken(user,tenantMember)
  }

  async verifyEmail(token: string): Promise<{message: string}> {
    await this.authHelper.verifyUser(token)
    return { message: 'Email verified successfully' };
  }

  async resendVerification(dto: EmailDto): Promise<{message: string}> {

    await this.authHelper.resendVerify(dto)

    return { message: 'If this email exists a verification link will be sent' }
  }

  async forgotPassword(dto: EmailDto): Promise<{message: string}> {
  
    await this.authHelper.forgotPass(dto)
    return { message: 'If this email exists you will receive a reset link' }
  }

  async resetPassword(token: string, dto: ResetPasswordDto): Promise<{message: string}> {
    await this.authHelper.resetPass(token, dto)
    return { message: 'Password reset successfully' }
  }

  async changePassword(dto: ChangePasswordDto, userData: UserData): Promise<{message: string}> {
    await this.authHelper.changePass(dto, userData)
    return { message: 'Password changed successfully' }
  }
}
