import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsEnum } from 'class-validator';
import { MapProp } from 'ts-simple-automapper';
import UserRoles from '../Types/Enums/UserRoles';

export default class UserManageDto {
    @IsDefined()
    @ApiProperty()
    @MapProp()
    public id: number;

    @IsEnum(UserRoles)
    @ApiProperty({ required: true, enum: UserRoles })
    @MapProp()
    public role: UserRoles;
}
