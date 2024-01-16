import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import IUserStore from "src/Infrastructure/Interfaces/Stores/IUserStore";
import { InjectRepository } from "@nestjs/typeorm";
import User from "src/Core/Domains/User";
import { Repository } from "typeorm";
import UserDto from "src/Core/DTO/UserDto";
import ObjectMapper from "src/Core/Shared/ObjectMapper";
import ValidatorRule from "src/Core/Shared/ValidatorRule";
import Guild from "src/Core/Domains/Guild";

@Injectable()
export default class UserStore implements IUserStore {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Guild)
        private guildRepository: Repository<Guild>
    ) {}

    async findAll(): Promise<Array<UserDto>> {
        return (await this.userRepository.find()).map((user) =>
            ObjectMapper.mapTo<UserDto>(user));
    }

    async findOne(id: number): Promise<UserDto> {
        const existingUser = await this.userRepository.findOne({
            relations: { guilds: true },
            where: { id: id }
        });

        ValidatorRule
            .when(existingUser == null)
            .triggerException(new HttpException(
                'There is no user with the given ID.',
                HttpStatus.BAD_REQUEST
            ));

        return ObjectMapper.mapTo<UserDto>(existingUser);
    }

    async create(userDto: UserDto): Promise<UserDto> {
        ValidatorRule
            .when(userDto.id &&
                (await this.userRepository
                    .findOneBy({ id: userDto.id })) != null)
            .triggerException(new HttpException(
                'A user with the same ID already exists.',
                HttpStatus.BAD_REQUEST
            ));

        const user = new User();

        user.updateUser(userDto);

        if (userDto.guildIds) {
            const guildsPromises = userDto.guildIds.map(async (guildId) => {
                const guild = await this.guildRepository.findOneBy({ id: guildId });
                ValidatorRule
                    .when(!guild)
                    .triggerException(new HttpException(
                        `There is no guild with the given ID ${guildId}.`,
                        HttpStatus.BAD_REQUEST
                    ));

                return guild;
            });
            user.guilds = await Promise.all(guildsPromises);
        }

        return await this.userRepository
            .save(user)
            .then((insertedUser) => ObjectMapper.mapTo<UserDto>(insertedUser))
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
            id: id || userDto.id,
        });

        ValidatorRule
            .when(!user)
            .triggerException(new HttpException(
                'There is no user with the given ID.',
                HttpStatus.BAD_REQUEST
            ));

        user.updateUser(userDto);

        if (userDto.guildIds) {
            const guildsPromises = userDto.guildIds.map(async (guildId) => {
                const guild = await this.guildRepository.findOneBy({ id: guildId });
                ValidatorRule
                    .when(!guild)
                    .triggerException(new HttpException(
                        `There is no guild with the given ID ${guildId}.`,
                        HttpStatus.BAD_REQUEST
                    ));

                return guild;
            });
            user.guilds = await Promise.all(guildsPromises);
        }

        return await this.userRepository
            .save(user)
            .then((updatedUser) => ObjectMapper.mapTo<UserDto>(updatedUser))
            .catch((onrejected) => {
                throw new HttpException(
                    `${onrejected}`,
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            });
    }

    async remove(id: number): Promise<void> {
        const existingUser = await this.userRepository.findOneBy({
            id: id
        });

        ValidatorRule
            .when(existingUser == null)
            .triggerException(
                new HttpException(
                    'There is no user with the given ID.',
                    HttpStatus.BAD_REQUEST
            ));

        return await this.userRepository
            .remove(existingUser)
            .then(() => {})
            .catch((onrejected) => {
                throw new HttpException(`${onrejected}`, HttpStatus.INTERNAL_SERVER_ERROR);
            });
    }
}
