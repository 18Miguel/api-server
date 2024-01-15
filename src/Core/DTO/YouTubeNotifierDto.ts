import { ApiProperty } from '@nestjs/swagger';

export default class YouTubeNotifierDto {
    @ApiProperty()
    id: number;

    @ApiProperty({ default: '[]' })
    channelsToPost: string = '[]';
}
