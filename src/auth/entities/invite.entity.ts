import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";
import { UserRole } from "src/common/enums/all.enums";

@Entity('invites')
export class Invite {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    email: string;

    @Column()
    token: string;

    @Column()
    role: UserRole;

    @Column()
    tenantId: string;

    @Column({ default: false })
    isAccepted: boolean;

    @Column()
    expiresAt: Date;

    @CreateDateColumn()
    createdAt: Date;
}