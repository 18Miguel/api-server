import { ApiProperty } from '@nestjs/swagger';

export default class GuildDto {
    @ApiProperty({ required: false })
    id?: number;

    @ApiProperty({ required: false, nullable: true, default: null })
    birthdayRole?: string = null;

    @ApiProperty({ required: false, nullable: true, default: null })
    birthdayChannel?: string = null;
}
