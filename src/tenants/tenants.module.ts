import { Module } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { PublicInvitesController, TenantsController } from './tenants.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant } from './entities/tenant.entity';
import { Ticket } from 'src/tickets/entities/ticket.entity';
import { UsersModule } from 'src/users/users.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { TenantMember } from './entities/tenant.member.entity';
import { Invite } from './entities/invite.entity';
import { User } from 'src/auth/entities/auth.entity';
import { AuthModule } from 'src/auth/auth.module';
import { TenantHelperService } from './tenants.helper.service';

@Module({
  imports: [TypeOrmModule.forFeature([Tenant, TenantMember, Invite, Ticket, User]), CloudinaryModule, AuthModule, UsersModule],
  controllers: [TenantsController,PublicInvitesController],
  providers: [TenantsService, TenantHelperService],
})
export class TenantsModule { }
