import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

// N'autorise l'accès que si l'utilisateur authentifié (req.user, injecté par
// JwtAuthGuard en amont) possède l'un des rôles requis par @Roles(...).
// Un USER ne peut donc jamais atteindre une route marquée @Roles(Role.ADMIN, Role.SUPER_ADMIN).
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException("Accès refusé pour ce rôle.");
    }
    return true;
  }
}
