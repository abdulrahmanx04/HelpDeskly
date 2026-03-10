import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../auth/entities/auth.entity';
import { Ticket } from '../../tickets/entities/ticket.entity';
import { Category } from '../../categories/entities/category.entity';
import { TenantLanguage } from 'src/common/enums/all.enums';
import { TenantMember } from 'src/members/entities/member.entity';
import { Invite } from 'src/invites/entities/invite.entity';

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  @Index(['slug'], { unique: true })
  slug: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  logo: string;

  @Column({ nullable: true })
  logoPublicId: string;

  @Column({ nullable: true })
  supportEmail: string;

  @Column({ default: 'UTC' })
  timezone: string;

  @Column({ type: 'enum', enum: TenantLanguage, default: TenantLanguage.AR })
  language: TenantLanguage

  @Column({ nullable: true })
  autoReplyMessage: string;

  @Column({ default: true })
  allowCustomerRegistration: boolean;

  @Column({ type: 'jsonb', nullable: true })
  businessHours: {
    saturday: { open: string; close: string; enabled: boolean };
    sunday: { open: string; close: string; enabled: boolean };
    monday: { open: string; close: string; enabled: boolean };
    tuesday: { open: string; close: string; enabled: boolean };
    wednesday: { open: string; close: string; enabled: boolean };
    thursday: { open: string; close: string; enabled: boolean };
    friday: { open: string; close: string; enabled: boolean };
  };

  @Column({ default: 'free' })
  plan: string;

  @Column({ type: 'uuid' })
  ownerId: string;

  @ManyToOne(() => User, (user) => user.tenantsOwned, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @OneToMany(() => TenantMember, (m) => m.tenant)
  memberships: TenantMember[];

  @OneToMany(() => Invite, i => i.tenant)
  invites: Invite[]

  @OneToMany(() => Ticket, (ticket) => ticket.tenant)
  tickets: Ticket[];

  @OneToMany(() => Category, (cat) => cat.tenant)
  categories: Category[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}