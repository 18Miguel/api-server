import MediaDto from "src/Core/DTO/MediaDto";
import IServerSentEventsService from "./IServerSentEventsService";
import SearchedMediaDto from "src/Core/DTO/SearchedMediaDto";
import MovieMediaDto from "src/Core/DTO/MovieMediaDto";
import TvMediaDto from "src/Core/DTO/TvShowMediaDto";
import MediaTypes from "src/Core/Types/Enums/MediaTypes";

export default interface IMediaService extends IServerSentEventsService {
    findOneById(mediaId: number, userId: number): Promise<MediaDto>;
    fetchDetailsByTitle(title: string): Promise<Array<SearchedMediaDto>>;
    /* markMovieMedia(tmdbId: number, watched: boolean, userId: number): Promise<MovieMediaDto>;
    markTvMedia(tmdbId: number, watched: boolean, userId: number): Promise<TvMediaDto>; */
    markMedia(tmdbId: number, watched: boolean, userId: number, type: MediaTypes): Promise<MovieMediaDto | TvMediaDto>;
    removeFromUserCatalog(mediaId: number, userId: number): Promise<boolean>;
}
