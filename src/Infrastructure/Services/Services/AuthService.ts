import { HttpException, HttpStatus, Injectable, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from 'bcrypt';
import IAuthService from "src/Infrastructure/Interfaces/Services/IAuthService";
import UserStore from "../Stores/UserStore";
import ObjectMapper from "src/Core/Shared/ObjectMapper";
import UserDto from "src/Core/DTO/UserDto";
import UserCredentialsDto from "src/Core/DTO/UserCredentialsDto";
import UserAuthDto from "src/Core/DTO/UserAuthDto";
import ValidatorRule from "src/Core/Shared/ValidatorRule";
import UserUpdateDto from "src/Core/DTO/UserUpdateDto";
import UserRoles from "src/Core/Types/Enums/UserRoles";
import { Mapper } from "ts-simple-automapper";

@Injectable()
export default class AuthService implements IAuthService {
    private readonly mapper: Mapper;

    constructor(private readonly userStore: UserStore) {
        this.mapper = new Mapper();
    }

    async registerNewAccount(userCredentialsDto: UserCredentialsDto): Promise<UserAuthDto> {
        const user = await this.userStore.create(this.mapper.map(userCredentialsDto, new UserDto()));
        return this.mapper.map(user, new UserAuthDto());
    }

    async login(userCredentialsDto: UserCredentialsDto): Promise<UserAuthDto> {
        const user = await this.userStore.findOneByUsername(userCredentialsDto.username);
        const passwordValid = await bcrypt.compare(userCredentialsDto.password, user.password);

        ValidatorRule
            .when(!passwordValid)
            .triggerException(new UnauthorizedException());

        return new Mapper().map(user, new UserAuthDto());
    }

    async updateAccount(userUpdateDto: UserUpdateDto): Promise<UserAuthDto> {
        const user = await this.userStore.findOneById(userUpdateDto.id);

        ValidatorRule
            .when(!user)
            .when(!(await bcrypt.compare(userUpdateDto.previousPassword, user.password)))
            .triggerException(new UnauthorizedException("Authentication failed."));

        const result = await this.userStore.update(userUpdateDto.id, this.mapper.map(userUpdateDto, new UserDto()));

        return this.mapper.map(result, new UserAuthDto());
    }

    async deleteAccount(id: number, userCredentialsDto: UserCredentialsDto): Promise<void> {
        const user = await this.userStore.findOneById(id);

        ValidatorRule
            .when(!user)
            .when(user.username != userCredentialsDto.username)
            .triggerException(new HttpException(
                'There is no user associated with the given ID and username.',
                HttpStatus.BAD_REQUEST
            ));

        ValidatorRule
            .when(!(await bcrypt.compare(userCredentialsDto.password, user.password)))
            .triggerException(new UnauthorizedException("Authentication failed."));
        
        return await this.userStore.remove(user.id);
    }

    async isAPIKeyValid(apiKey: string): Promise<boolean> {
        const user = await this.userStore.findOneByApiKey(apiKey);

        ValidatorRule
            .when(!user)
            .triggerException(new UnauthorizedException("Invalid API key."));

        return true;
    }
    
    async isRoleValid(apiKey: string) {
        const user = await this.userStore.findOneByApiKey(apiKey);

        ValidatorRule
            .when(!user)
            .triggerException(new UnauthorizedException("Invalid API key."));

        ValidatorRule
            .when(user.role === UserRoles.User)
            .when(user.role === UserRoles.Bot)
            .triggerException(new UnauthorizedException());

        return true;
    }
}
