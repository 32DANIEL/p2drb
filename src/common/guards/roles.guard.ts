/* eslint-disable prettier/prettier */
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../../roles/role.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required) return true;

    const { user } = context.switchToHttp().getRequest();
    const userRoles: string[] = (user?.roles ?? []).map((r: Role) => r.role_name);
    const has = required.some((r) => userRoles.includes(r));
    if (!has) throw new ForbiddenException('No autorizado');
    return true;
  }
}
