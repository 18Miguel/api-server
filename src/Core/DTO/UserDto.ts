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
    @ApiProperty({ required: false })
    @MapProp()
    public role?: UserRoles;

    @ApiProperty({ required: false })
    @MapProp()
    public apiKey?: string;
    
    @ApiProperty({ required: false })
    @MapProp()
    public apiKeyCreateAt?: Date;
}
