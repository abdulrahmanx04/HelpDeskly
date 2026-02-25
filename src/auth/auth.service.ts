import { Injectable } from '@nestjs/common';
import { ChangePasswordDto, EmailDto, LoginDto, RegisterTenantDto, ResetPasswordDto } from './dto/create-auth.dto';
import { UserData } from 'src/common/interfaces/all.interfaces';
import { AuthServiceHelper } from './auth.service.helper';
@Injectable()
export class AuthService {
  constructor(private authHelper: AuthServiceHelper) { }
  
  async registerTenant(dto: RegisterTenantDto) {
    await this.authHelper.tenantExists(dto.slug)
    const result = await this.authHelper.registerAdminAndTenant(dto)
    return this.authHelper.signToken(result.admin,result.tenant.id)
  }

  async login(dto: LoginDto) {
    const tenant = await this.authHelper.tenantValidation(dto.slug)
    const user = await this.authHelper.authBeforeLogin(dto, tenant.id)
    return this.authHelper.signToken(user,tenant.id)
  }

  async verifyEmail(token: string) {
    await this.authHelper.verifyUser(token)
    return { message: 'Email verified successfully' };
  }

  async resendVerification(dto: EmailDto) {

    await this.authHelper.resendVerify(dto)

    return { message: 'If this email exists a verification link will be sent' }
  }

  async forgotPassword(dto: EmailDto) {
  
    await this.authHelper.forgotPass(dto)
    return { message: 'If this email exists you will receive a reset link' }
  }

  async resetPassword(token: string, dto: ResetPasswordDto) {
    await this.authHelper.resetPass(token, dto)
    return { message: 'Password reset successfully' }
  }

  async changePassword(dto: ChangePasswordDto, userData: UserData) {
    await this.authHelper.changePass(dto, userData)
    return { message: 'Password changed successfully' }
  }
}
