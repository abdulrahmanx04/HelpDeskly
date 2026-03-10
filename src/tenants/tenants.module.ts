import { Module } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import {  TenantsController } from './tenants.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant } from './entities/tenant.entity';
import { Ticket } from 'src/tickets/entities/ticket.entity';
import { UsersModule } from 'src/users/users.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { User } from 'src/auth/entities/auth.entity';
import { AuthModule } from 'src/auth/auth.module';
import { TenantHelperService } from './tenants.helper.service';
import { TenantMember } from 'src/members/entities/member.entity';
import { Invite } from 'src/invites/entities/invite.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tenant, TenantMember, Invite, Ticket, User]), CloudinaryModule, AuthModule, UsersModule],
  controllers: [TenantsController],
  providers: [TenantsService, TenantHelperService],
})
export class TenantsModule { }
