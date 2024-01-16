import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToMany,
    JoinTable,
} from 'typeorm';
import User from './User';
import GuildDto from '../DTO/GuildDto';

@Entity()
export default class Guild {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    birthdayRole?: string = null;

    @Column({ nullable: true })
    birthdayChannel?: string = null;

    @ManyToMany(() => User, (user) => user.guilds, { cascade: true })
    @JoinTable()
    users: Array<User>;

    updateGuild(guildDto: GuildDto) {
        this.id = guildDto.id;
        this.birthdayRole = guildDto.birthdayRole || null;
        this.birthdayChannel = guildDto.birthdayChannel || null;
    }
}
