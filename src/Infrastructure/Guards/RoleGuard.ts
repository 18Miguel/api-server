import { Injectable, CanActivate, ExecutionContext, Inject, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from 'src/Core/Types/Decorator/Roles';
import IAuthService from '../Interfaces/Services/IAuthService';
import UserRoles from 'src/Core/Types/Enums/UserRoles';
import ValidatorRule from 'src/Core/Shared/ValidatorRule';

@Injectable()
export default class RolesGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        @Inject('IAuthService') private readonly authService: IAuthService
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredRoles = this.reflector.getAllAndOverride<Array<UserRoles>>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles) return true;
        
        const request = context.switchToHttp().getRequest();
        const token = (request.headers['Authorization'] ?? request.headers['authorization']) as string;

        ValidatorRule
            .when(!token)
            .triggerException(new UnauthorizedException(
                "An API token is required for this operation."
            ));

        const user = await this.authService.findUserByApiToken(token.replace('Bearer ', ''));
        return user && requiredRoles.some((role) => user.role.valueOf() == role.valueOf());
    }
}
