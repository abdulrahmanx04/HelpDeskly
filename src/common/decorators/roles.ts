import { SetMetadata } from "@nestjs/common";
import { TenantMemberRole } from "../enums/all.enums";

export const Roles = (...roles: TenantMemberRole[]) => SetMetadata('roles', roles)