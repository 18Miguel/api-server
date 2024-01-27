import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsNotEmpty } from 'class-validator';
import { MapProp } from 'ts-simple-automapper';

export default class UserUpdateDto {
    @IsDefined()
    @ApiProperty()
    @MapProp()
    public id: number;

    @IsNotEmpty()
    @ApiProperty()
    @MapProp()
    public username: string;
    
    @IsNotEmpty()
    @ApiProperty()
    @MapProp()
    public password: string;
    
    @IsNotEmpty()
    @ApiProperty()
    @MapProp()
    public previousPassword: string;
}
