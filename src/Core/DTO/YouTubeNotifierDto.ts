import { ApiProperty } from '@nestjs/swagger';
import { IsDefined } from 'class-validator';
import { MapProp } from 'ts-simple-automapper';

export default class YouTubeNotifierDto {
    @IsDefined()
    @ApiProperty()
    @MapProp()
    public id: number;

    @ApiProperty({ default: '[]' })
    @MapProp()
    public channelsToPost: string = '[]';
}
