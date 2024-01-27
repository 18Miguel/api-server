import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import IUserStore from "src/Infrastructure/Interfaces/Stores/IUserStore";
import { InjectRepository } from "@nestjs/typeorm";
import User from "src/Core/Domains/User";
import { Repository } from "typeorm";
import UserDto from "src/Core/DTO/UserDto";
import ObjectMapper from "src/Core/Shared/ObjectMapper";
import ValidatorRule from "src/Core/Shared/ValidatorRule";
import { randomBytes } from "crypto";
import * as bcrypt from 'bcrypt';
import UserRoles from "src/Core/Types/Enums/UserRoles";
import { Mapper } from "ts-simple-automapper";

@Injectable()
export default class UserStore implements IUserStore {
    private readonly saltRounds = 8;
    private readonly mapper: Mapper;

    constructor(
        @InjectRepository(User) private userRepository: Repository<User>
    ) {
        this.mapper = new Mapper();
    }

    async findAll(): Promise<Array<UserDto>> {
        return (await this.userRepository.find()).map((user) => {
            const { password, apiKey, ...result } = user;
            return this.mapper.map(result, new UserDto());
        });
    }

    async findOneById(id: number): Promise<UserDto> {
        const existingUser = await this.userRepository.findOneBy({ id: id ?? 0 });

        ValidatorRule
            .when(!id)
            .when(existingUser == null)
            .triggerException(new HttpException(
                'There is no user with the given ID.',
                HttpStatus.BAD_REQUEST
            ));

        return this.mapper.map(existingUser, new UserDto());
    }

    async findOneByUsername(username: string): Promise<UserDto> {
        const existingUser = await this.userRepository.findOneBy({ username: username ?? ''});

        ValidatorRule
            .when(existingUser == null)
            .triggerException(new HttpException(
                'There is no user with the given username.',
                HttpStatus.BAD_REQUEST
            ));

        return this.mapper.map(existingUser, new UserDto());
    }

    async findOneByApiKey(apiKey: string): Promise<UserDto> {
        const existingUser = await this.userRepository.findOneBy({ apiKey: apiKey ?? '' })

        ValidatorRule
            .when(!existingUser)
            .triggerException(new HttpException(
                'There is no user with the given API key.',
                HttpStatus.BAD_REQUEST
            ));
        
        delete existingUser.password;
        return this.mapper.map(existingUser, new UserDto());
    }

    async create(userDto: UserDto): Promise<UserDto> {
        ValidatorRule
            .when(!userDto.username)
            .triggerException(new HttpException(
                'The username is required.',
                HttpStatus.BAD_REQUEST
            ));

        ValidatorRule
            .when(await this.userRepository
                .findOneBy({ username: userDto.username ?? '' }) != null)
            .triggerException(new HttpException(
                'The username is already taken.',
                HttpStatus.BAD_REQUEST
            ));

        ValidatorRule
            .when(userDto.id &&
                (await this.userRepository
                    .findOneBy({ id: userDto.id ?? 0 })) != null)
            .triggerException(new HttpException(
                'A user with the same ID already exists.',
                HttpStatus.BAD_REQUEST
            ));

        const user = new User();

        user.id = userDto.id;
        user.username = userDto.username;
        user.password = await bcrypt.hash(userDto.password, this.saltRounds);
        user.role = UserRoles.User;
        user.apiKey = randomBytes(16).toString('hex');

        return await this.userRepository
            .save(user)
            .then((insertedUser) => this.mapper.map(insertedUser, new UserDto()))
            .catch((onrejected) => {
                throw new HttpException(
                    `${onrejected}`,
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            });
    }

    async update(id: number, userDto: UserDto): Promise<UserDto> {
        ValidatorRule
            .when(id != userDto.id)
            .triggerException(new HttpException(
                'The provided user ID does not match the URL parameter ID.',
                HttpStatus.BAD_REQUEST
            ));

        const user = await this.userRepository.findOneBy({
            id: (id || userDto.id) ?? 0,
        });

        ValidatorRule
            .when(!user)
            .triggerException(new HttpException(
                'There is no user with the given ID.',
                HttpStatus.BAD_REQUEST
            ));

        const existingUser = await this.userRepository.findOneBy({
            username: userDto.username ?? ''
        });

        ValidatorRule
            .when(!existingUser && existingUser.id != userDto.id)
            .triggerException(new HttpException(
                'The username is already taken.',
                HttpStatus.BAD_REQUEST
            ));

        user.username = userDto.username;
        user.password = await bcrypt.hash(userDto.password, this.saltRounds);
        user.role = userDto.role || user.role || UserRoles.User;
        user.apiKey = randomBytes(16).toString('hex');
        user.apiKeyCreateAt = new Date();

        return await this.userRepository
            .save(user)
            .then((updatedUser) => this.mapper.map(updatedUser, new UserDto()))
            .catch((onrejected) => {
                throw new HttpException(
                    `${onrejected}`,
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            });
    }

    async remove(id: number): Promise<void> {
        const existingUser = await this.userRepository.findOneBy({
            id: id ?? 0
        });

        ValidatorRule
            .when(existingUser == null)
            .triggerException(new HttpException(
                'There is no user with the given ID.',
                HttpStatus.BAD_REQUEST
            ));

        return await this.userRepository
            .remove(existingUser)
            .then(() => {})
            .catch((onrejected) => {
                throw new HttpException(
                    `${onrejected}`,
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            });
    }
}
