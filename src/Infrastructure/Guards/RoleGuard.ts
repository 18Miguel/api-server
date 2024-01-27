import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from 'src/Core/Types/Decorator/Roles';
import UserRoles from 'src/Core/Types/Enums/UserRoles';

@Injectable()
export default class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Array<UserRoles>>(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
    ]);

    if (!requiredRoles) {
        return true;
    }
    
    const { user } = context.switchToHttp().getRequest();
    console.log('RolesGuard user:', user);
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}
