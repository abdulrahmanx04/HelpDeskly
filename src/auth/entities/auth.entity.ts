import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  BeforeInsert,
  BeforeUpdate,
  DeleteDateColumn,
} from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { Ticket } from '../../tickets/entities/ticket.entity';
import { Message } from 'src/messages/entities/message.entity';
import { TenantMember } from '../../tenants/entities/tenant.member.entity';
import * as bcrypt from 'bcrypt';
import {  GlobalUserRole } from 'src/common/enums/all.enums';

@Entity('users')
@Index(['verificationToken', 'verificationExpiry'])
@Index(['email', 'isActive'])  
@Index(['verificationToken'])                        
@Index(['resetPasswordToken']) 
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPass() {
    if (!this.password) return;
    const isAlreadyHashed =
      this.password.startsWith('$2a$') ||
      this.password.startsWith('$2b$') ||
      this.password.startsWith('$2y$');
    if (isAlreadyHashed) return;
    this.password = await bcrypt.hash(this.password, 10);
  }

  @Column({ type: 'enum', enum:  GlobalUserRole, default: GlobalUserRole.USER })
  role:  GlobalUserRole

  @Column({ type: 'varchar', nullable: true })
  resetPasswordToken: string | null;

  @Column({ type: 'timestamp', nullable: true })
  resetPasswordExpiry: Date | null;

  @Column({ type: 'varchar', nullable: true })
  verificationToken: string | null;

  @Column({ type: 'timestamp', nullable: true })
  verificationExpiry: Date | null;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isOnline: boolean;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ type: 'varchar',nullable: true })
  avatar: string | null;

  @Column({ type: 'varchar',nullable: true })
  avatarPublicId: string | null;

  @OneToMany(() => TenantMember, (m) => m.user)
  memberships: TenantMember[];


  @OneToMany(() => Tenant, (tenant) => tenant.owner)
  tenantsOwned: Tenant[];


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