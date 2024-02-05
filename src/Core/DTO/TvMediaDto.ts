import { ApiProperty } from "@nestjs/swagger";
import MediaCatalogDto from "./MediaCatalogDto";

export default class TvMediaDto extends MediaCatalogDto {    
    @ApiProperty({ required: false })
    public lastAirDate?: Date;
    
    @ApiProperty({ required: false })
    public numberOfSeasons?: number;
    
    @ApiProperty({ required: false })
    public voteAverage?: number;
}
