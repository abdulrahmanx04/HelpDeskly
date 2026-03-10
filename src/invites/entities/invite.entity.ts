import { InviteStatus, TenantMemberRole } from "src/common/enums/all.enums";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToOne, Index, ManyToOne, JoinColumn } from "typeorm";
import { User } from "src/auth/entities/auth.entity";
import { Tenant } from "src/tenants/entities/tenant.entity";

@Entity('invites')
@Index(['email', 'tenantId', 'status'])
@Index(['token'], { unique: true })
@Index(['tenantId', 'status'])
@Index(['tenantId', 'role'])
export class Invite {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    email: string;

    @Column({
        type: 'enum',
        enum: InviteStatus,
        default: InviteStatus.PENDING
    })
    status: InviteStatus;

    @Column()
    token: string;


    @Column({ type: 'enum', enum: TenantMemberRole, default: TenantMemberRole.AGENT })
    role: TenantMemberRole;

    @Column()
    tenantId: string;

    @ManyToOne(() => Tenant, t => t.invites)
    @JoinColumn({ name: 'tenantId' })
    tenant: Tenant

    @Column()
    invitedBy: string;

    @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'invitedBy' })
    inviter: User;

    @Column({ type: 'timestamp', nullable: true })
    acceptedAt: Date | null;

    @Column({ type: 'varchar', nullable: true })
    acceptedBy: string

    @Column({ type: 'timestamp', nullable: true })
    revokedAt?: Date;

    @Column({ nullable: true })
    revokedBy?: string;

    @Column()
    expiresAt: Date;

    @CreateDateColumn()
    createdAt: Date;
    isExpired(): boolean {
        return new Date() > this.expiresAt;
    }

    canBeAccpeted(): boolean {
        return this.status == InviteStatus.PENDING && !this.isExpired()
    }
}