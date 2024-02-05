import { ApiProperty } from "@nestjs/swagger";
import MediaTypes from "../Types/Enums/MediaTypes";

export default class SearchedMediaDto {
    @ApiProperty()
    public id: number;

    @ApiProperty({ enum: MediaTypes })
    public mediaType: MediaTypes;

    @ApiProperty({ required: false })
    public title?: string;

    @ApiProperty({ required: false })
    public overview?: string;

    @ApiProperty({ required: false })
    public releaseDate?: Date;

    @ApiProperty({ required: false })
    public genres?: string;
    
    @ApiProperty({ required: false, nullable: true })
    public posterUriPath?: string | null;

    @ApiProperty({ required: false, nullable: true })
    public backdropUriPath?: string | null;

    @ApiProperty({ required: false })
    public voteAverage?: number;
}
