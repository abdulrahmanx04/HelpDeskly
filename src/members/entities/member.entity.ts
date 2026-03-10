import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../../auth/entities/auth.entity';
import { TenantMemberRole } from 'src/common/enums/all.enums';
import { MemberStatus } from 'src/common/enums/all.enums';
import { Tenant } from 'src/tenants/entities/tenant.entity';

@Entity('tenant_members')
@Index(['tenantId', 'userId'], { unique: true })
@Index(['tenantId', 'role'])
@Index(['tenantId', 'status'])
export class TenantMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'enum', enum: TenantMemberRole, default: TenantMemberRole.AGENT })
  role: TenantMemberRole;

  @Column({ type: 'enum', enum: MemberStatus, default: MemberStatus.ACTIVE })
  status: MemberStatus;

  @ManyToOne(() => Tenant, (tenant) => tenant.memberships, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @ManyToOne(() => User, (user) => user.memberships, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  invitedBy?: string;

  @Column({ nullable: true })
  deletedBy?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}