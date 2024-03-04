import Media from 'src/Core/Domains/Media';
import MediaDto from 'src/Core/DTO/MediaDto';
import MediaTypes from 'src/Core/Types/Enums/MediaTypes';

export default interface IMediaStore {
    findMediaById(id: number): Promise<MediaDto>;
    findMediaByTMDBId(tmdbId: number, type: MediaTypes): Promise<MediaDto>;
    getListOfTvShowsInProduction(): Promise<Array<Media> | null>;
    create(mediaDto: MediaDto): Promise<MediaDto>;
    update(id: number, mediaDto: MediaDto): Promise<MediaDto>;
    remove(id: number): Promise<boolean>;
}
