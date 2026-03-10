import { Module } from '@nestjs/common';
import { InvitesService } from './invites.service';
import { InvitesController, PublicInvitesController } from './invites.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant } from 'src/tenants/entities/tenant.entity';
import { Invite } from './entities/invite.entity';
import { User } from 'src/auth/entities/auth.entity';
import { TenantMember } from 'src/members/entities/member.entity';
import { AuthModule } from 'src/auth/auth.module';
import { InviteHelperService } from './invites.service.helepr';

@Module({
  imports : [TypeOrmModule.forFeature([Tenant,Invite,User,TenantMember]),AuthModule],
  controllers: [InvitesController,PublicInvitesController],
  providers: [InvitesService,InviteHelperService],
})
export class InvitesModule {}
