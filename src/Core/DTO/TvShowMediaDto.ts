import { ApiProperty } from "@nestjs/swagger";
import { MapProp } from "ts-simple-automapper";
import MediaDto from "./MediaDto";
import VideoDto from "./VideoDto";

export default class TvShowMediaDto extends MediaDto {
    @ApiProperty({ required: false })
    @MapProp()
    public numberOfSeasons?: number;

    @ApiProperty({ required: false })
    @MapProp()
    public lastAirDate?: Date;

    @ApiProperty({ required: false, isArray: true, type: VideoDto })
    public videos?: Array<VideoDto>;
}
