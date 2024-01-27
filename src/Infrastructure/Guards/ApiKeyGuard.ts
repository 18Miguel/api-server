import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import AuthService from "../Services/Services/AuthService";

@Injectable()
export default class ApiKeyGuard implements CanActivate {
    constructor(private readonly authService: AuthService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const key = request.headers['X-API-Key'] ?? request.headers['x-api-key'] ?? request.query['api_key'];
        return this.authService.isAPIKeyValid(key);
    }
}
