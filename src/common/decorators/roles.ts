import { SetMetadata } from "@nestjs/common";
import { UserRole } from "../enums/all.enums";

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles)