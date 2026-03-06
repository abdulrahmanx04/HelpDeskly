import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/auth.entity';
import { Tenant } from 'src/tenants/entities/tenant.entity';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from 'src/common/guards/jwt.strategy';
import { TenantMember } from 'src/tenants/entities/tenant.member.entity';
import { AuthServiceHelper } from './auth.service.helper';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' }), TypeOrmModule.forFeature([User, Tenant,TenantMember]), JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy,AuthServiceHelper],
  exports: [AuthServiceHelper],
})
export class AuthModule { }
