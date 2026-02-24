import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ChangePasswordDto, EmailDto, LoginDto, RegisterDto, RegisterTenantDto, ResetPasswordDto } from './dto/create-auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/auth.entity';
import { Admin, DataSource, LessThan, MoreThan, Repository } from 'typeorm';
import { Tenant } from 'src/tenants/entities/tenant.entity';
import { UserRole } from 'src/common/enums/all.enums';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt'
import * as crypto from 'crypto'
import { sendEmail } from 'src/common/utils/email';
import { v4 as uuid } from 'uuid'
import { UserData } from 'src/common/interfaces/all.interfaces';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Tenant) private tenantRepo: Repository<Tenant>,
    private dataSource: DataSource,
    private jwtService: JwtService
  ) { }
  async registerTenant(dto: RegisterTenantDto) {
    await this.tenantExists(dto.slug)
    const result = await this.registerAdminAndTenant(dto)
    return this.signToken(result.admin)
  }

  async register(dto: RegisterDto) {
    const tenant = await this.tenantValidation(dto.slug)

    await this.userExists(dto, tenant)
    const user = await this.registerUser(dto, tenant)
    return this.signToken(user);
  }


  async login(dto: LoginDto) {
    const tenant = await this.tenantValidation(dto.slug)
    const user = await this.authBeforeLogin(dto, tenant.id)
    return this.signToken(user)
  }

  async verifyEmail(token: string) {
    await this.verifyUser(token)
    return { message: 'Email verified successfully' };
  }

  async resendVerification(dto: EmailDto) {
    const tenant = await this.tenantValidation(dto.slug)

    await this.resendVerify(dto, tenant)

    return { message: 'If this email exists a verification link will be sent' }
  }

  async forgotPassword(dto: EmailDto) {
    const tenant = await this.tenantValidation(dto.slug)
    await this.forotPass(dto, tenant)
    return { message: 'If this email exists you will receive a reset link' }
  }

  async resetPassword(token: string, dto: ResetPasswordDto) {
    await this.resetPass(token, dto)
    return { message: 'Password reset successfully' }
  }

  async changePassword(dto: ChangePasswordDto, userData: UserData) {
    await this.changePass(dto, userData)
    return { message: 'Password changed successfully' }
  }


  private signToken(user: User) {
    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId
    }, { secret: process.env.JWT, expiresIn: '7d' })
    return { token }
  }

  private async tenantExists(slug: string) {
    const tenant = await this.tenantRepo.findOne({ where: { slug } })
    if (tenant) {
      throw new BadRequestException('Tenant slug is used')
    }
  }
  private async tenantValidation(slug: string) {
    const tenant = await this.tenantRepo.findOne({
      where: { slug, isActive: true },
    })
    if (!tenant) {
      throw new NotFoundException(`No active company found for slug: "${slug}"`);
    }
    return tenant
  }

  private async registerAdminAndTenant(dto: RegisterTenantDto) {
    const { hashed, url } = this.generateVerificationToken(dto.email, 'verify-email')
    const result = await this.dataSource.transaction(async (manager) => {
      const tenant = manager.create(Tenant, {
        name: dto.companyName,
        slug: dto.slug,
        isActive: true,
      })

      await manager.save(tenant)


      const admin = manager.create(User, {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        password: dto.password,
        role: UserRole.ADMIN,
        tenantId: tenant.id,
        verificationToken: hashed,
        verificationExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

      })

      await manager.save(admin)
      return { tenant, admin }
    })
    await sendEmail('verification', result.admin.email, url)
    return result
  }

  private async userExists(dto: RegisterDto, tenant: Tenant) {
    const existingUser = await this.userRepo.findOne({
      where: { email: dto.email, tenantId: tenant.id },
    });
    if (existingUser) {
      throw new ConflictException('Email is already registered for this company');
    }
  }

  private async registerUser(dto: RegisterDto, tenant: Tenant) {
    const { hashed, url } = this.generateVerificationToken(dto.email, 'verify-email')
    const user = this.userRepo.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      password: dto.password,
      role: UserRole.CUSTOMER,
      tenantId: tenant.id,
      verificationExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      verificationToken: hashed
    });
    await Promise.all([sendEmail('verification', user.email, url), this.userRepo.save(user)])
    return user
  }

  private async authBeforeLogin(dto: LoginDto, tenantId: string) {
    const user = await this.userRepo.findOne({ where: { email: dto.email, tenantId, isActive: true } })
    if (!user) {
      throw new BadRequestException('Invalid credentials')
    }
    const checkPass = await bcrypt.compare(dto.password, user.password)
    if (!checkPass) {
      throw new BadRequestException('Invalid credentials')
    }
    return user
  }

  private generateVerificationToken(email: string, type: string): { hashed: string, url: string } {
    const token = uuid()
    const hashed = crypto.createHash('sha256').update(token).digest('hex')
    const url = `${process.env.FRONTEND_URL}/auth/${type}/${token}`
    return { hashed, url }
  }
  private async verifyUser(token: string) {
    const verificationToken = crypto.createHash('sha256').update(token).digest('hex')
    console.log(token, verificationToken)
    const user = await this.userRepo.findOne({
      where: { verificationToken, verificationExpiry: MoreThan(new Date()) },
    })

    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    user.isVerified = true;
    user.verificationToken = null
    user.verificationExpiry = null
    await this.userRepo.save(user);
  }

  private async forotPass(dto: EmailDto, tenant: Tenant) {
    const user = await this.userRepo.findOne({ where: { email: dto.email, tenantId: tenant.id, isActive: true } })
    if (!user) return { message: 'If this email exists you will receive a reset link' }
    const { hashed, url } = this.generateVerificationToken(user.email, 'reset-password')
    user.resetPasswordToken = hashed,
      user.resetPasswordExpiry = new Date(Date.now() + 1 * 60 * 60 * 1000)
    await this.userRepo.save(user)
    await sendEmail('reset', user.email, url)
  }

  private async resetPass(token: string, dto: ResetPasswordDto) {
    const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex')
    const user = await this.userRepo.findOne({
      where: { resetPasswordToken, resetPasswordExpiry: MoreThan(new Date()) },
    })
    if (!user) {
      throw new BadRequestException('Invalid or expired link');
    }
    user.password = dto.password
    user.resetPasswordToken = null
    user.resetPasswordExpiry = null
    await this.userRepo.save(user)
  }
  private async changePass(dto: ChangePasswordDto, userData: UserData) {
    const user = await this.userRepo.findOne({ where: { id: userData.id } })
    if (!user) throw new NotFoundException('User not found')

    const comparePass = await bcrypt.compare(dto.currentPassword, user.password)
    if (!comparePass) throw new BadRequestException('Current password is wrong')

    if (dto.currentPassword == dto.newPassword) {
      throw new BadRequestException('New password and current password cannot be the same')
    }
    user.password = dto.newPassword
    await this.userRepo.save(user)

  }

  private async resendVerify(dto: EmailDto, tenant: Tenant) {
    const user = await this.userRepo.findOne({
      where: { email: dto.email, tenantId: tenant.id, isActive: true }
    })

    if (!user) return { message: 'If this email exists a verification link will be sent' }


    if (user.isVerified) {
      throw new BadRequestException('Email is already verified')
    }


    const { hashed, url } = this.generateVerificationToken(dto.email, 'verify-email')


    user.verificationToken = hashed
    user.verificationExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    await this.userRepo.save(user)

    // 7. Send email
    await sendEmail('verification', user.email, url)
  }
}
