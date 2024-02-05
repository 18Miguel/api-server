import { ApiProperty } from "@nestjs/swagger";
import MediaCatalogDto from "./MediaCatalogDto";

export default class MovieMediaDto extends MediaCatalogDto {
    @ApiProperty({ required: false })
    public runtime?: number;

    @ApiProperty({ required: false })
    public voteAverage?: number;
}
