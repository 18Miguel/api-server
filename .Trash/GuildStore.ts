/* import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import IGuildStore from "src/Infrastructure/Interfaces/Stores/IGuildStore";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import Guild from "src/Core/Domains/Guild";
import GuildDto from "src/!Trash/GuildDto";
import ObjectMapper from "src/Core/Shared/ObjectMapper";
import ValidatorRule from "src/Core/Shared/ValidatorRule";

@Injectable()
export default class GuildStore implements IGuildStore {
    constructor(
        @InjectRepository(Guild)
        private guildRepository: Repository<Guild>,
    ) {}

    async findAll(): Promise<Array<GuildDto>> {
        return (await this.guildRepository.find()).map((guild) =>
            ObjectMapper.mapTo<GuildDto>(guild));
    }

    async findOne(id: number): Promise<GuildDto> {
        const existingGuild = await this.guildRepository.findOne({
            relations: { users: true },
            where: { id: id }
        });

        ValidatorRule
            .when(existingGuild == null)
            .triggerException(new HttpException(
                'There is no guild with the given ID.',
                HttpStatus.BAD_REQUEST
            ));

        return ObjectMapper.mapTo<GuildDto>(existingGuild);
    }

    async create(guildDto: GuildDto): Promise<GuildDto> {
        ValidatorRule
            .when(guildDto.id &&
                (await this.guildRepository
                    .findOneBy({id: guildDto.id })) != null)
            .triggerException(new HttpException(
                'A guild with the same ID already exists.',
                HttpStatus.BAD_REQUEST
            ));

        const guild = new Guild();

        guild.updateGuild(guildDto);

        return await this.guildRepository
            .save(guild)
            .then((insertedGuild) => ObjectMapper.mapTo<GuildDto>(insertedGuild))
            .catch((onrejected) => {
                throw new HttpException(`${onrejected}`, HttpStatus.INTERNAL_SERVER_ERROR);
            });
    }

    async update(id: number, guildDto: GuildDto): Promise<GuildDto> {
        ValidatorRule
            .when(id != guildDto.id)
            .triggerException(new HttpException(
                'The provided guild ID does not match the URL parameter ID.',
                HttpStatus.BAD_REQUEST
            ));

        const guild = await this.guildRepository.findOneBy({
            id: id || guildDto.id,
        });

        ValidatorRule
            .when(!guild)
            .triggerException(new HttpException(
                'There is no guild with the given ID.',
                HttpStatus.BAD_REQUEST
            ));

            guild.updateGuild(guildDto);

        return await this.guildRepository
            .save(guild)
            .then((updatedGuild) => ObjectMapper.mapTo<GuildDto>(updatedGuild))
            .catch((onrejected) => {
                throw new HttpException(`${onrejected}`, HttpStatus.INTERNAL_SERVER_ERROR);
            });
    }

    async remove(id: number): Promise<void> {
        const existingGuild = await this.guildRepository.findOneBy({
            id: id,
        });

        ValidatorRule
            .when(existingGuild == null)
            .triggerException(
                new HttpException(
                    'There is no guild with the given ID.',
                    HttpStatus.BAD_REQUEST
            ));

        return await this.guildRepository
            .remove(existingGuild)
            .then(() => {})
            .catch((onrejected) => {
                throw new HttpException(`${onrejected}`, HttpStatus.INTERNAL_SERVER_ERROR);
            });
    }
}
 */
//create
/* if (userDto.guildIds) {
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
        } */

//update
/* if (userDto.guildIds) {
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
        } */