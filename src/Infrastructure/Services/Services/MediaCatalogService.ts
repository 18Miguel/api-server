import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Observable, Subject } from 'rxjs';
import IMediaCatalogService from 'src/Infrastructure/Interfaces/Services/IMediaCatalogService';
import IServerSentEventsService from 'src/Infrastructure/Interfaces/Services/IServerSentEventsService';
import IMediaCatalogStore from 'src/Infrastructure/Interfaces/Stores/IMediaCatalogStore';
import MediaCatalogStore from '../Stores/MediaCatalogStore';
import MediaCatalogDto from 'src/Core/DTO/MediaCatalogDto';

@Injectable()
export default class MediaCatalogService implements IMediaCatalogService, IServerSentEventsService, IMediaCatalogStore  {
    private readonly logger = new Logger(MediaCatalogService.name);
    private readonly subject = new Subject<MessageEvent<MediaCatalogDto>>();

    constructor(private readonly mediaCatalogStore: MediaCatalogStore) {}
    
    @Cron(CronExpression.EVERY_10_SECONDS)
    private updateTVShowsData(): void {
        this.logger.log('TV Show updated');
        const mediaCatalogDto = new MediaCatalogDto();
        mediaCatalogDto.type = "movie";
        mediaCatalogDto.title = "The Updated Movie - Part 96";
        this.sendData(mediaCatalogDto);
    }

    getObservable(): Observable<MessageEvent<MediaCatalogDto>> {
        return this.subject.asObservable();
    }

    sendData(data: MediaCatalogDto): void {
        this.subject.next(new MessageEvent('message', { data }));
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
