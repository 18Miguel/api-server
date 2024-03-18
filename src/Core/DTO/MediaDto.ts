import { ApiProperty } from '@nestjs/swagger';
import { Int, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsDateString, IsNotEmpty, IsOptional, IsPositive, Min, ValidateIf } from 'class-validator';
import { MapProp } from 'ts-simple-automapper';
import MediaTypes from '../Types/Enums/MediaTypes';
import { FilterableField } from 'src/Infrastructure/GraphQL/Utils/Decorators/FilterableField';

@ObjectType()
export default class MediaDto {
    @FilterableField(() => Int)
    @IsOptional()
    @IsPositive()
    @ApiProperty({ required: false })
    @MapProp()
    public id?: number;
    
    @FilterableField(() => Int)
    @ApiProperty({ required: true })
    @MapProp()
    public tmdbId: number;

    @FilterableField(() => MediaTypes)
    @IsNotEmpty()
    @ApiProperty({ required: true, enum: MediaTypes })
    @MapProp()
    public type: MediaTypes;

    @FilterableField()
    @IsNotEmpty()
    @ApiProperty({ required: true })
    @MapProp()
    public title: string;
    
    @ApiProperty({ required: false, nullable: true })
    public overview: string;

    @FilterableField()
    @IsDateString()
    @ApiProperty({ required: true })
    @MapProp()
    public releaseDate: Date;

    @FilterableField()
    @ApiProperty({ required: true, example: 'Genre A, Genre B, ...' })
    @MapProp()
    public genres: string;
    
    @FilterableField({ nullable: true, defaultValue: null })
    @ApiProperty({ required: true })
    @MapProp()
    public posterPath: string;

    @ApiProperty({ required: false, nullable: true })
    public backdropPath?: string | null;

    @ApiProperty({ required: false })
    public voteAverage?: number;

    @FilterableField({ nullable: true, defaultValue: null })
    @IsOptional()
    @IsBoolean()
    @ApiProperty({ required: false, nullable: true, default: null })
    @MapProp()
    public inProduction?: boolean;

    @FilterableField(() => Int, { nullable: true, defaultValue: null })
    @Min(0)
    @ValidateIf((_, value) => value == undefined || value == null)
    @ApiProperty({ required: false, nullable: true, minimum: 0, default: null })
    @MapProp()
    public numberOfEpisodes?: number;

    @FilterableField()
    @IsBoolean()
    @ApiProperty({ required: true, default: false })
    @MapProp()
    public watched: boolean;
}
