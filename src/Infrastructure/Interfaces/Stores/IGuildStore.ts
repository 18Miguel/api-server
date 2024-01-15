import GuildDto from 'src/Core/DTO/GuildDto';

export default interface IGuildStore {
    findAll(): Promise<Array<GuildDto>>;
    findOne(id: number): Promise<GuildDto>;
    create(guildDto: GuildDto): Promise<GuildDto>;
    update(id: number, guildDto: GuildDto): Promise<GuildDto>;
    remove(id: number): Promise<void>;
}
