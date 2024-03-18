import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { CACHE_MANAGER, Cache } from "@nestjs/cache-manager";
import IAuthService from "src/Infrastructure/Interfaces/Services/IAuthService";
import ValidatorRule from "src/Core/Shared/ValidatorRule";
import { GqlExecutionContext } from "@nestjs/graphql";

@Injectable()
export default class ApiTokenGuard implements CanActivate {
    constructor(
        @Inject('IAuthService') private readonly authService: IAuthService,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>() ?? GqlExecutionContext.create(context).getContext().req as Request;
        const token = (request.headers['Authorization'] ?? request.headers['authorization']) as string;

        ValidatorRule
            .when(!token)
            .triggerException(new UnauthorizedException(
                "An API token is required for this operation."
            ));

        const authenticatedUserId = await this.cacheManager.get<number>(token.replace('Bearer ', ''));
        if (authenticatedUserId) {
            request.headers['User-Id'] = `${authenticatedUserId}`;
            return true;
        }

        const { validToken, userId } = await this.authService.isAPITokenValid(token.replace('Bearer ', ''));

        if (validToken) {
            request.headers['User-Id'] = `${userId}`;
            await this.cacheManager.set(token.replace('Bearer ', ''), userId, 1000 * 60 * 10);
        }
        return validToken;
    }
}
