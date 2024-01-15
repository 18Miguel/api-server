import MediaCatalogDto from 'src/Core/DTO/MediaCatalogDto';

export default interface IMediaCatalogStore {
    findAll(): Promise<Array<MediaCatalogDto>>;
    findOne(id: number): Promise<MediaCatalogDto>;
    create(mediaCatalogDto: MediaCatalogDto): Promise<MediaCatalogDto>;
    update(
        id: number,
        mediaCatalogDto: MediaCatalogDto,
    ): Promise<MediaCatalogDto>;
    remove(id: number): Promise<void>;
}
