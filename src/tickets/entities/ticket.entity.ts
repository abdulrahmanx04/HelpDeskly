import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { User } from '../../auth/entities/auth.entity';
import { Category } from '../../categories/entities/category.entity';
import { Message } from '../../messages/entities/message.entity';
import { Attachment } from '../../attachments/entities/attachment.entity'
import { TicketPriority, TicketStatus } from 'src/common/enums/all.enums';

@Entity('tickets')
@Index(['tenantId', 'status'])
@Index(['tenantId', 'priority'])
@Index(['tenantId', 'agentId'])
@Index(['tenantId', 'customerId'])
@Index(['tenantId', 'categoryId'])
@Index(['tenantId', 'createdAt'])
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  subject: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: TicketStatus, default: TicketStatus.OPEN })
  status: TicketStatus;

  @Column({ type: 'enum', enum: TicketPriority, default: TicketPriority.MEDIUM })
  priority: TicketPriority;

  @Column()
  tenantId: string;

  @ManyToOne(() => Tenant, (tenant) => tenant.tickets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column()
  customerId: string;

  @ManyToOne(() => User, (user) => user.submittedTickets)
  @JoinColumn({ name: 'customerId' })
  customer: User;

  @Column({ nullable: true })
  agentId: string;

  @ManyToOne(() => User, (user) => user.assignedTickets, { nullable: true })
  @JoinColumn({ name: 'agentId' })
  agent: User;

  @Column({ nullable: true })
  categoryId: string;

  @ManyToOne(() => Category, (cat) => cat.tickets, { nullable: true })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @OneToMany(() => Message, (message) => message.ticket)
  messages: Message[];

  @OneToMany(() => Attachment, (att) => att.ticket, { cascade: true })
  attachments: Attachment[];

  @Column({ nullable: true })
  resolvedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}