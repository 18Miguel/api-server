import { ApiProperty } from '@nestjs/swagger';
import UserRoles from '../Types/Enums/UserRoles';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { MapProp } from 'ts-simple-automapper';

export default class UserDto {
    @ApiProperty({ required: false })
    @MapProp()
    public id?: number;

    @IsNotEmpty()
    @ApiProperty({ required: false })
    @MapProp()
    public username: string;
    
    @IsNotEmpty()
    @ApiProperty({ required: false })
    @MapProp()
    public password?: string;

    @IsEnum(UserRoles, { always: false })
    @ApiProperty({ required: false, enum: UserRoles })
    @MapProp()
    public role?: UserRoles;

    @ApiProperty({ required: false })
    @MapProp()
    public apiToken?: string;
    
    @ApiProperty({ required: false })
    @MapProp()
    public apiTokenCreateAt?: Date;
}
