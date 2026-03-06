import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthRequest } from '../interfaces/all.interfaces';
import { TenantMemberRole} from 'src/common/enums/all.enums';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<TenantMemberRole[]>(
            'roles',
            [context.getHandler(), context.getClass()],
        )

        if (!requiredRoles) return true

        const request = context.switchToHttp().getRequest<AuthRequest>();
        const user = request.user;

        if (!user) return false

        return requiredRoles.includes(user.tenantRole as TenantMemberRole)
    }
}