
export enum GlobalUserRole {
  SUPER_ADMIN= 'SUPER_ADMIN',
  USER= 'USER'
}
export enum TenantMemberRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  AGENT = 'agent',
  CUSTOMER = 'customer',
}
export enum TicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  PENDING = 'pending',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}


export enum MemberStatus {
  INVITED = 'invited',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
}

export enum TenantLanguage {
  AR= 'ar',
  EN= 'en',
}

export enum InviteStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    REVOKED = 'REVOKED',
    EXPIRED = 'EXPIRED'
}
