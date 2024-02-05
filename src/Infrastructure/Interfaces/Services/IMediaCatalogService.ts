import MediaCatalogDto from "src/Core/DTO/MediaCatalogDto";
import IServerSentEventsService from "./IServerSentEventsService";
import SearchedMediaDto from "src/Core/DTO/SearchedMediaDto";
import MovieMediaDto from "src/Core/DTO/MovieMediaDto";
import TvMediaDto from "src/Core/DTO/TvMediaDto";

export default interface IMediaCatalogService extends IServerSentEventsService {
    findAll(): Promise<Array<MediaCatalogDto>>;
    findOneById(id: number): Promise<MediaCatalogDto>;
    fetchDetailsByTitle(title: string): Promise<Array<SearchedMediaDto>>;
    markMovieMedia(id: number, watched: boolean, userId: number): Promise<MovieMediaDto>;
    markTvMedia(id: number, watched: boolean, userId: number): Promise<TvMediaDto>;
    removeMedia(mediaId: number, userId: number): Promise<boolean>;
}
