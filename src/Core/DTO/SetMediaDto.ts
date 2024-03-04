import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsNumber, IsPositive, ValidateIf } from 'class-validator';
import MediaTypes from "../Types/Enums/MediaTypes";

export default class SetMediaDto {
    @IsNumber()
    @IsPositive()
    @ApiProperty()
    public tmdbId: number;
    
    @IsEnum(MediaTypes)
    @ApiProperty()
    public mediaType: MediaTypes;
    
    @IsBoolean()
    @ValidateIf((_, value) => value != undefined)
    @ApiProperty({ required: false, default: false })
    public watched?: boolean;
}