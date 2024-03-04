import { ApiProperty } from "@nestjs/swagger";
import { MapProp } from "ts-simple-automapper";

export default class VideoDto {
    @ApiProperty()
    @MapProp()
    public id: string;

    @ApiProperty()
    public name: string;
    
    @ApiProperty()
    @MapProp()
    public type: string;
    
    @ApiProperty({ example: 'YouTube' })
    @MapProp()
    public site: string;
    
    @ApiProperty()
    @MapProp()
    public key: string;
    
    @ApiProperty()
    @MapProp()
    public official: boolean;
    
    @ApiProperty()
    @MapProp()
    public publishedAt: Date;
}
