import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import IMediaCatalogService from 'src/Infrastructure/Interfaces/Services/IMediaCatalogService';
import MediaCatalogStore from '../Stores/MediaCatalogStore';
import SocketGateway from 'src/Infrastructure/Adapters/SocketGateway';
import MediaCatalogDto from 'src/Core/DTO/MediaCatalogDto';
import IMediaCatalogStore from 'src/Infrastructure/Interfaces/Stores/IMediaCatalogStore';

@Injectable()
export default class MediaCatalogService implements IMediaCatalogService, IMediaCatalogStore  {
    private readonly logger = new Logger(MediaCatalogService.name);

    constructor(
        private readonly mediaCatalogStore: MediaCatalogStore,
        private readonly socketGateway: SocketGateway
    ) {}
    
    @Cron(CronExpression.EVERY_MINUTE)
    private updateTVShowsData(): void {
        this.logger.log('TV Show updated');
        this.socketGateway.streamDataToClients('media-updated', {
            id: 12312, title: 'The Movie',
        });
    }

    async findAll(): Promise<Array<MediaCatalogDto>> {
        return await this.mediaCatalogStore.findAll();
    }

    async findOne(id: number): Promise<MediaCatalogDto> {
        return await this.mediaCatalogStore.findOne(id);
    }

    async create(mediaCatalogDto: MediaCatalogDto): Promise<MediaCatalogDto> {
        return await this.mediaCatalogStore.create(mediaCatalogDto);
    }

    async update(id: number, mediaCatalogDto: MediaCatalogDto ): Promise<MediaCatalogDto> {
        return await this.mediaCatalogStore.update(id, mediaCatalogDto);
    }

    async remove(id: number): Promise<void> {
        return await this.mediaCatalogStore.remove(id);
    }
}
