import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import Guild from './Guild';

@Entity()
export default class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    birthdayDate?: Date = null;

    @ManyToMany(() => Guild, (guild) => guild.users)
    guilds: Array<Guild>;

    guildIds?: Array<number>;

    /* constructor(user?: User) {
        if (!user) return;

        if (user.birthdayDate && new Date(user.birthdayDate).getTime() > new Date().getTime())
            throw new BadRequestError("The birthday date must be from today onwards.");
        
        this.id = user.id;
        this.birthdayDate = user.birthdayDate || null;
        this.guilds = user.guilds || null;
    } */
}
