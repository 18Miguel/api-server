import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { MapProp } from 'ts-simple-automapper';

export default class UserCredentialsDto {
    @IsNotEmpty()
    @ApiProperty()
    @MapProp()
    public username: string;
    
    @IsNotEmpty()
    @ApiProperty()
    @MapProp()
    public password: string;
}
