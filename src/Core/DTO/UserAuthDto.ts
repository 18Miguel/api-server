import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { MapProp } from 'ts-simple-automapper';

export default class UserAuthDto {
    @ApiProperty({ required: false })
    @MapProp()
    public id: number;

    @IsNotEmpty()
    @ApiProperty()
    @MapProp()
    public username: string;

    @ApiProperty({ required: false })
    @MapProp()
    public apiToken: string;
    
    @ApiProperty({ required: false })
    @MapProp()
    public apiTokenCreateAt: Date;
}
