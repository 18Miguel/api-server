import MediaDto from 'src/Core/DTO/MediaDto';

export default interface IUserMediaCatalogStore {
    findUserMedia(id: number, userId: number): Promise<MediaDto>;
    create(mediaDto: MediaDto, userId: number): Promise<MediaDto>;
    update(id: number, mediaDto: MediaDto, userId: number): Promise<MediaDto>;
    remove(id: number, userId: number): Promise<boolean>;
}
