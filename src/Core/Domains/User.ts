import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import Guild from './Guild';
import UserDto from '../DTO/UserDto';
import ValidatorRule from '../Shared/ValidatorRule';
import { HttpException, HttpStatus } from '@nestjs/common';

@Entity()
export default class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    birthdayDate?: Date = null;

    @ManyToMany(() => Guild, (guild) => guild.users)
    guilds: Array<Guild>;

    updateUser(userDto: UserDto) {
        ValidatorRule
            .when(userDto.birthdayDate &&
                new Date(userDto.birthdayDate).getTime() > new Date().getTime())
            .triggerException(new HttpException(
                'The birthday date must be from today onwards.',
                HttpStatus.BAD_REQUEST
            ));

        this.id = userDto.id;
        this.birthdayDate = userDto.birthdayDate || null;
        this.guilds = [];
    }
}
