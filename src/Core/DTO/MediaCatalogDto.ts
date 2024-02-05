import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsNotEmpty, IsPositive, Min, ValidateIf } from 'class-validator';
import { MapProp } from 'ts-simple-automapper';
import MediaTypes from '../Types/Enums/MediaTypes';

export default class MediaCatalogDto {
    @IsPositive()
    @ValidateIf((_, value) => value !== undefined)
    @ApiProperty({ required: false })
    @MapProp()
    public id?: number;

    @IsNotEmpty()
    @ApiProperty({ required: true, enum: MediaTypes })
    @MapProp()
    public type: MediaTypes;

    @IsNotEmpty()
    @ApiProperty({ required: true })
    @MapProp()
    public title: string;

    @IsDateString()
    @ApiProperty({ required: true })
    @MapProp()
    public releaseDate: Date;

    @ApiProperty({ required: true })
    @MapProp()
    public genres: string;

    @Min(0)
    @ValidateIf((_, value) => value != undefined || value != null)
    @ApiProperty({ required: false, nullable: true, minimum: 0, default: null })
    @MapProp()
    public numberOfEpisodes?: number;
    
    @IsBoolean()
    @ValidateIf((_, value) => value != undefined || value != null)
    @ApiProperty({ required: false, nullable: true, default: null })
    @MapProp()
    public inProduction?: boolean;

    @IsBoolean()
    @ApiProperty({ required: true, default: false })
    @MapProp()
    public watched: boolean;

    public userId: number;
}
