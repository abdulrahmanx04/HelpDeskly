import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../auth/entities/auth.entity';
import { Ticket } from '../../tickets/entities/ticket.entity';
import { Category } from '../../categories/entities/category.entity';
import { TenantMember } from './tenant.member.entity';

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Index()
  @Column({ unique: true })
  slug: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'uuid' })
  ownerId: string;

  @ManyToOne(() => User, (user) => user.tenantsOwned, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'ownerId' })
  owner: User;

 
  @OneToMany(() => TenantMember, (m) => m.tenant)
  memberships: TenantMember[];

  @OneToMany(() => Ticket, (ticket) => ticket.tenant)
  tickets: Ticket[];

  @OneToMany(() => Category, (cat) => cat.tenant)
  categories: Category[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}