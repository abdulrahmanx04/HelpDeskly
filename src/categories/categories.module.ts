import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Tenant } from 'src/tenants/entities/tenant.entity';
import { UsersModule } from 'src/users/users.module';
import { TenantMember } from 'src/members/entities/member.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Category,Tenant,TenantMember]),UsersModule],
  controllers: [CategoriesController],
  providers: [CategoriesService],
})
export class CategoriesModule {}
