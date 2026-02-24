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
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { Ticket } from '../../tickets/entities/ticket.entity';
import { Message } from 'src/messages/entities/message.entity';
import { UserRole } from 'src/common/enums/all.enums';
import * as bcrypt from 'bcrypt'
@Entity('users')
@Index(['email', 'tenantId'], { unique: true })
@Index(['email', 'tenantId', 'isActive'])
@Index(['verificationToken', 'verificationExpiry'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column()
  password: string;
  @BeforeInsert()
  @BeforeUpdate()
  async hashPass() {
    if(!this.password) return
    const isAlreadyHashed =
      this.password.startsWith('$2a$') ||
      this.password.startsWith('$2b$') ||
      this.password.startsWith('$2y$');
    if (isAlreadyHashed) return;
    this.password = await bcrypt.hash(this.password, 10)
  }

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CUSTOMER })
  role: UserRole


  @Column({ default: 0 })
  activeTicketsCount: number; // used for auto-assignment (max 5 per agent)

  @Column({ type: 'varchar', nullable: true })
  resetPasswordToken: string | null

  @Column({ type: 'timestamp', nullable: true })
  resetPasswordExpiry: Date | null

  @Column({ type: 'varchar', nullable: true })
  verificationToken: string | null

  @Column({ type: 'timestamp', nullable: true })
  verificationExpiry: Date | null

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isOnline: boolean;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true })
  avatar: string;

  @Column()
  tenantId: string

  @ManyToOne(() => Tenant, (tenant) => tenant.users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @OneToMany(() => Ticket, (ticket) => ticket.customer)
  submittedTickets: Ticket[];

  @OneToMany(() => Ticket, (ticket) => ticket.agent)
  assignedTickets: Ticket[];

  @OneToMany(() => Message, (message) => message.sender)
  messages: Message[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}