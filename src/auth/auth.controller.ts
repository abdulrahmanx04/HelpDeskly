import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import {  RegisterTenantDto, LoginDto, EmailDto, ResetPasswordDto, ChangePasswordDto } from './dto/create-auth.dto';
import type { UserData } from 'src/common/interfaces/all.interfaces';
import { JwtAuthGuard } from 'src/common/guards/auth.guard';
import { CurrentUser } from 'src/common/decorators/current.user';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('tenant/register')
  registerTenant(@Body() dto: RegisterTenantDto) {
    return this.authService.registerTenant(dto);
  }

  @Post('resend-email')
  resendEmail(@Body() dto: EmailDto) {
    return this.authService.resendVerification(dto)
  }


  @Get('verify-email/:token')
  verifyEmail(@Param('token') token: string) {
    return this.authService.verifyEmail(token)
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto)
  }

  @Post('forgot-password')
  forgotPassword(@Body() dto: EmailDto) {
    return this.authService.forgotPassword(dto)
  }

  @Post('reset-password/:token')
  resetPassword(@Param('token') token: string, @Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(token, dto)
  }


  @UseGuards(JwtAuthGuard)
  @Patch('password')
  changePassword(@Body() dto: ChangePasswordDto, @CurrentUser() userData: UserData) {
    return this.authService.changePassword(dto, userData)
  }


}
