import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource, MoreThan } from "typeorm";
import { User } from "./entities/auth.entity";
import { Tenant } from "src/tenants/entities/tenant.entity";
import { JwtService } from "@nestjs/jwt";
import { EmailDto, RegisterTenantDto, LoginDto, ResetPasswordDto, ChangePasswordDto } from "./dto/create-auth.dto";
import { GlobalUserRole, MemberStatus, TenantMemberRole } from "src/common/enums/all.enums";
import { sendEmail } from "src/common/utils/email";
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { v4 as uuid } from 'uuid'
import { UserData } from "src/common/interfaces/all.interfaces";
import { TenantMember } from "src/members/entities/member.entity";

@Injectable()
export class AuthServiceHelper {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Tenant) private tenantRepo: Repository<Tenant>,
    @InjectRepository(TenantMember) private memberRepo: Repository<TenantMember>,
    private dataSource: DataSource,
    private jwtService: JwtService
  ) { }

  signToken(user: User, tenantMember: TenantMember) {
    const token = this.jwtService.sign(
       {sub: user.id,email: user.email,tenantId: tenantMember.tenantId,tenantRole: tenantMember.role},
       { secret: process.env.JWT, expiresIn: '7d' })
    return { token }
  }
  generateVerificationToken(email: string, type: string): { hashed: string, url: string } {
    const token = uuid()
    const hashed = crypto.createHash('sha256').update(token).digest('hex')
    const url = `${process.env.FRONTEND_URL}/auth/${type}/${token}`
    return { hashed, url }
  }
  async tenantExists(slug: string) {
    const tenant = await this.tenantRepo.findOne({ where: { slug } })
    if (tenant) {
      throw new ConflictException('Company slug is used')
    }
  }
  async tenantValidation(slug: string) {
    const tenant = await this.tenantRepo.findOne({
      where: { slug, isActive: true },
    })
    if (!tenant) {
      throw new NotFoundException(`No active company found for slug: "${slug}"`);
    }
    return tenant
  }
  async userExists(dto: RegisterTenantDto) {
    const existingUser = await this.userRepo.findOne({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email is already used');
    }
  }

  async registerAdminAndTenant(dto: RegisterTenantDto) {
      const { hashed, url } = this.generateVerificationToken(dto.email, 'verify-email')
      await this.userExists(dto)
      const result = await this.dataSource.transaction(async (manager) => {
        const admin = manager.create(User, {
          firstName: dto.firstName,
          lastName: dto.lastName,
          email: dto.email,
          password: dto.password,
          role: GlobalUserRole.SUPER_ADMIN,
          verificationToken: hashed,
          verificationExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });
        await manager.save(admin)

        const tenant = manager.create(Tenant, {
          name: dto.companyName,
          slug: dto.slug,
          isActive: true,
          ownerId: admin.id,
          businessHours: {
            monday: { open: '09:00', close: '17:00', enabled: true },
            tuesday: { open: '09:00', close: '17:00', enabled: true },
            wednesday: { open: '09:00', close: '17:00', enabled: true },
            thursday: { open: '09:00', close: '17:00', enabled: true },
            friday: { open: '09:00', close: '17:00', enabled: true },
            saturday: { open: '09:00', close: '17:00', enabled: false },
            sunday: { open: '09:00', close: '17:00', enabled: false },
          },
        });
        await manager.save(tenant);

        const membership = manager.create(TenantMember, {
          tenantId: tenant.id,
          userId: admin.id,
          role: TenantMemberRole.OWNER,
          status: MemberStatus.ACTIVE
        });
        await manager.save(membership);

        return { tenant, admin, membership };
      })
      await sendEmail('verification', result.admin.email, url)
      return result
  }


  async authBeforeLogin(dto: LoginDto, tenantId: string) {
    const user = await this.userRepo.findOne({ where: { email: dto.email, isActive: true } })
    if (!user) {
      throw new BadRequestException('Invalid credentials')
    }
    const checkPass = await bcrypt.compare(dto.password, user.password)
    if (!checkPass) {
      throw new BadRequestException('Invalid credentials')
    }
    const tenantMember = await this.memberRepo.findOne({ where: { userId: user.id, tenantId, status: MemberStatus.ACTIVE } })
    if (!tenantMember) {
      throw new BadRequestException('User is not a member of this company or company does not exist');
    }
    return { user, tenantMember }
  }


  async verifyUser(token: string) {
    const verificationToken = crypto.createHash('sha256').update(token).digest('hex')
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

  async forgotPass(dto: EmailDto) {
    const user = await this.userRepo.findOne({ where: { email: dto.email, isActive: true } })
    if (!user) return { message: 'If this email exists you will receive a reset link' }
    const { hashed, url } = this.generateVerificationToken(user.email, 'reset-password')
    user.resetPasswordToken = hashed,
      user.resetPasswordExpiry = new Date(Date.now() + 1 * 60 * 60 * 1000)
    await this.userRepo.save(user)
    await sendEmail('reset', user.email, url)
  }

  async resetPass(token: string, dto: ResetPasswordDto) {
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
  async changePass(dto: ChangePasswordDto, userData: UserData) {
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

  async resendVerify(dto: EmailDto) {
    const user = await this.userRepo.findOne({
      where: { email: dto.email, isActive: true }
    })

    if (!user) return { message: 'If this email exists a verification link will be sent' }


    if (user.isVerified) {
      throw new BadRequestException('Email is already verified')
    }


    const { hashed, url } = this.generateVerificationToken(dto.email, 'verify-email')


    user.verificationToken = hashed
    user.verificationExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    await this.userRepo.save(user)


    await sendEmail('verification', user.email, url)
  }
}