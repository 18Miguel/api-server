import { ApiProperty } from '@nestjs/swagger';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsDateString, IsNotEmpty, IsOptional, IsPositive, Min, ValidateIf } from 'class-validator';
import { MapProp } from 'ts-simple-automapper';
import MediaTypes from '../Types/Enums/MediaTypes';

@ObjectType('Media')
export default class MediaDto {
    @Field(() => Int)
    @IsOptional()
    @IsPositive()
    @ApiProperty({ required: false })
    @MapProp()
    public id?: number;
    
    @Field(() => Int)
    @ApiProperty({ required: true })
    @MapProp()
    public tmdbId: number;

    @Field(() => MediaTypes)
    @IsNotEmpty()
    @ApiProperty({ required: true, enum: MediaTypes })
    @MapProp()
    public type: MediaTypes;

    @Field()
    @IsNotEmpty()
    @ApiProperty({ required: true })
    @MapProp()
    public title: string;

    @Field()
    @IsDateString()
    @ApiProperty({ required: true })
    @MapProp()
    public releaseDate: Date;

    @Field()
    @ApiProperty({ required: true, example: 'Genre A, Genre B, ...' })
    @MapProp()
    public genres: string;
    
    @Field({ nullable: true, defaultValue: null })
    @ApiProperty({ required: true })
    @MapProp()
    public posterPath: string;

    @ApiProperty({ required: false, nullable: true })
    public backdropPath?: string | null;

    @ApiProperty({ required: false })
    public voteAverage?: number;

    @Field({ nullable: true, defaultValue: null })
    @IsOptional()
    @IsBoolean()
    @ApiProperty({ required: false, nullable: true, default: null })
    @MapProp()
    public inProduction?: boolean;

    @Field(() => Int, { nullable: true, defaultValue: null })
    @Min(0)
    @ValidateIf((_, value) => value == undefined || value == null)
    @ApiProperty({ required: false, nullable: true, minimum: 0, default: null })
    @MapProp()
    public numberOfEpisodes?: number;

    @Field()
    @IsBoolean()
    @ApiProperty({ required: true, default: false })
    @MapProp()
    public watched: boolean;
}
