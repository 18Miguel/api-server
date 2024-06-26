import { ApiProperty } from "@nestjs/swagger";
import MediaDto from "./MediaDto";
import VideoDto from "./VideoDto";
import { MapProp } from "ts-simple-automapper";

export default class MovieMediaDto extends MediaDto {    
    @ApiProperty({ required: false })
    @MapProp()
    public runtime?: number;

    @ApiProperty({ required: false, isArray: true, type: VideoDto })
    public videos?: Array<VideoDto>;
}
