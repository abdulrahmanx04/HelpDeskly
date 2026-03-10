import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { Ticket } from '../../tickets/entities/ticket.entity';

@Entity('categories')
@Index(['tenantId', 'name'], { unique: true })
@Index(['tenantId', 'isActive'])
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 7, nullable: true })
  color?: string

  @Column({ default: true })
  isActive: boolean

  @Column()
  tenantId: string;

  @ManyToOne(() => Tenant, (tenant) => tenant.categories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @OneToMany(() => Ticket, (ticket) => ticket.category)
  tickets: Ticket[];

  @Column({ nullable: true })
  deletedBy?: string

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

}