import { Module } from '@nestjs/common';
import { MembersService } from './members.service';
import { MembersController } from './members.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/auth.entity';
import { Tenant } from 'src/tenants/entities/tenant.entity';
import { TenantMember } from './entities/member.entity';
import { MemberHelperService } from './members.helper.service';

@Module({
  imports: [TypeOrmModule.forFeature([User,Tenant,TenantMember])],
  controllers: [MembersController],
  providers: [MembersService,MemberHelperService],
})
export class MembersModule {}
