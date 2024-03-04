import { HttpException, HttpStatus, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from 'bcrypt';
import IAuthService from "src/Infrastructure/Interfaces/Services/IAuthService";
import IUserStore from "src/Infrastructure/Interfaces/Stores/IUserStore";
import UserDto from "src/Core/DTO/UserDto";
import UserCredentialsDto from "src/Core/DTO/UserCredentialsDto";
import UserAuthDto from "src/Core/DTO/UserAuthDto";
import ValidatorRule from "src/Core/Shared/ValidatorRule";
import UserUpdateDto from "src/Core/DTO/UserUpdateDto";
import UserRoles from "src/Core/Types/Enums/UserRoles";
import { Mapper } from "ts-simple-automapper";

@Injectable()
export default class AuthService implements IAuthService {
    constructor(
        @Inject('IUserStore') private readonly userStore: IUserStore,
        @Inject('Mapper') private readonly mapper: Mapper
    ) {}

    public async registerNewAccount(userCredentialsDto: UserCredentialsDto): Promise<UserAuthDto> {
        const user = await this.userStore.create(this.mapper.map(userCredentialsDto, new UserDto()));
        return this.mapper.map(user, new UserAuthDto());
    }

    public async login(userCredentialsDto: UserCredentialsDto): Promise<UserAuthDto> {
        const user = await this.userStore.findOneByUsername(userCredentialsDto.username);
        const passwordValid = await bcrypt.compare(userCredentialsDto.password, user.password);

        ValidatorRule
            .when(!passwordValid)
            .triggerException(new UnauthorizedException());

        return this.mapper.map(user, new UserAuthDto());
    }

    public async updateAccount(id: number, userUpdateDto: UserUpdateDto): Promise<UserAuthDto> {
        const user = await this.userStore.findOneById(id);

        ValidatorRule
            .when(!user)
            .when(!(await bcrypt.compare(userUpdateDto.previousPassword, user.password)))
            .triggerException(new UnauthorizedException("Authentication failed."));

        userUpdateDto['id'] = id;
        const result = await this.userStore.update(id, this.mapper.map(userUpdateDto, new UserDto()));

        return this.mapper.map(result, new UserAuthDto());
    }

    public async deleteAccount(id: number, userCredentialsDto: UserCredentialsDto): Promise<boolean> {
        const user = await this.userStore.findOneById(id);

        ValidatorRule
            .when(!user)
            .triggerException(new UnauthorizedException("Authentication failed."));

        ValidatorRule
            .when(user.username != userCredentialsDto.username)
            .triggerException(new HttpException(
                'There is no user associated with the given username.',
                HttpStatus.BAD_REQUEST
            ));

        ValidatorRule
            .when(!(await bcrypt.compare(userCredentialsDto.password, user.password)))
            .triggerException(new UnauthorizedException("Authentication failed.\r\nCheck your credentials."));
        
        return await this.userStore.remove(user.id);
    }

    public async isAPITokenValid(apiToken: string): Promise<{ validToken: boolean, userId: number }> {
        ValidatorRule
            .when(!apiToken)
            .triggerException(new UnauthorizedException("An API token is required for this operation."));

        const user = await this.userStore.findOneByApiToken(apiToken);

        ValidatorRule
            .when(!user)
            .triggerException(new UnauthorizedException("Invalid API key."));

        return { validToken: true, userId: user.id };
    }
    
    public async findUserByApiToken(apiToken: string): Promise<UserDto> {
        const user = await this.userStore.findOneByApiToken(apiToken);

        ValidatorRule
            .when(!user)
            .triggerException(new UnauthorizedException("Invalid API key."));

        return user;
    }
    
    public async isRoleValid(apiToken: string) {
        const user = await this.userStore.findOneByApiToken(apiToken);

        ValidatorRule
            .when(!user)
            .triggerException(new UnauthorizedException("Invalid API token."));

        ValidatorRule
            .when(user.role === UserRoles.User)
            .when(user.role === UserRoles.Manager)
            .triggerException(new UnauthorizedException());

        return true;
    }
}
