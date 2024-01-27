import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDate, IsNotEmpty, IsPositive, Min } from 'class-validator';
import { MapProp } from 'ts-simple-automapper';

export default class MediaCatalogDto {
    @IsPositive()
    @ApiProperty({ required: false })
    @MapProp()
    public id?: number;

    @IsNotEmpty()
    @ApiProperty({ required: true })
    @MapProp()
    public type: string;

    @IsNotEmpty()
    @ApiProperty({ required: true })
    @MapProp()
    public title: string;

    @IsDate()
    @ApiProperty({ required: true })
    @MapProp()
    public releaseDate: Date;

    @ApiProperty({ required: true })
    @MapProp()
    public genres: string;

    @Min(0)
    @ApiProperty({ required: false, nullable: true, minimum: 0, default: null })
    @MapProp()
    public numberOfEpisodes?: number = null;

    @IsBoolean()
    @ApiProperty({ required: true, default: false })
    @MapProp()
    watched: boolean;
}
