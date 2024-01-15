import { ApiProperty } from '@nestjs/swagger';

export default class MediaCatalogDto {
    @ApiProperty({ required: false })
    id?: number;

    @ApiProperty({ required: true })
    type: string;

    @ApiProperty({ required: true })
    title: string;

    @ApiProperty({ required: true })
    releaseDate: Date;

    @ApiProperty({ required: true })
    genres: string;

    @ApiProperty({ required: false, nullable: true, minimum: 0, default: null })
    numberOfEpisodes?: number = null;

    @ApiProperty({ required: true, default: false })
    watched: boolean;
}
