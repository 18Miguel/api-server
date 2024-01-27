import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import IMediaCatalogStore from 'src/Infrastructure/Interfaces/Stores/IMediaCatalogStore';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import MediaCatalog from 'src/Core/Domains/MediaCatalog';
import MediaCatalogDto from 'src/Core/DTO/MediaCatalogDto';
import ObjectMapper from 'src/Core/Shared/ObjectMapper';
import ValidatorRule from 'src/Core/Shared/ValidatorRule';
import { Mapper } from 'ts-simple-automapper';

@Injectable()
export default class MediaCatalogStore implements IMediaCatalogStore {
    private readonly mapper: Mapper;

    constructor(
        @InjectRepository(MediaCatalog)
        private mediaCatalogRepository: Repository<MediaCatalog>
    ) {
        this.mapper = new Mapper();
    }

    async findAll(): Promise<Array<MediaCatalogDto>> {
        return (await this.mediaCatalogRepository.find()).map((mediaCatalog) =>
            this.mapper.map(mediaCatalog, new MediaCatalogDto()));
    }

    async findOne(id: number): Promise<MediaCatalogDto> {
        const existingMedia = await this.mediaCatalogRepository.findOneBy({ id: id ?? 0 });

        ValidatorRule
            .when(existingMedia == null)
            .triggerException(new HttpException(
                'There is no media with the given ID.',
                HttpStatus.BAD_REQUEST
            ));

        return this.mapper.map(existingMedia, new MediaCatalogDto());
    }

    async create(mediaCatalogDto: MediaCatalogDto): Promise<MediaCatalogDto> {
        ValidatorRule
            .when(mediaCatalogDto.id &&
                (await this.mediaCatalogRepository
                    .findOneBy({id: mediaCatalogDto.id ?? 0 })) != null)
            .triggerException(new HttpException(
                'A media with the same ID already exists.',
                HttpStatus.BAD_REQUEST
            ));

        const mediaCatalog = new MediaCatalog();

        mediaCatalog.updateMediaCatalog(mediaCatalogDto);

        return await this.mediaCatalogRepository
            .save(mediaCatalog)
            .then((insertedMedia) => this.mapper.map(insertedMedia, new MediaCatalogDto()))
            .catch((onrejected) => {
                throw new HttpException(`${onrejected}`, HttpStatus.INTERNAL_SERVER_ERROR);
            });
    }

    async update(id: number, mediaCatalogDto: MediaCatalogDto ): Promise<MediaCatalogDto> {
        ValidatorRule
            .when(id != mediaCatalogDto.id)
            .triggerException(new HttpException(
                'The provided media ID does not match the URL parameter ID.',
                HttpStatus.BAD_REQUEST
            ));

        const mediaCatalog = await this.mediaCatalogRepository.findOneBy({
            id: (id || mediaCatalogDto.id) ?? 0,
        });

        ValidatorRule
            .when(!mediaCatalog)
            .triggerException(new HttpException(
                'There is no media with the given ID.',
                HttpStatus.BAD_REQUEST
            ));

        mediaCatalog.updateMediaCatalog(mediaCatalogDto);

        return await this.mediaCatalogRepository
            .save(mediaCatalog)
            .then((updatedMedia) => this.mapper.map(updatedMedia, new MediaCatalogDto()))
            .catch((onrejected) => {
                throw new HttpException(`${onrejected}`, HttpStatus.INTERNAL_SERVER_ERROR);
            });
    }

    async remove(id: number): Promise<void> {
        const existingMedia = await this.mediaCatalogRepository.findOneBy({
            id: id ?? 0,
        });

        ValidatorRule
            .when(existingMedia == null)
            .triggerException(
                new HttpException(
                    'There is no media with the given ID.',
                    HttpStatus.BAD_REQUEST
            ));

        return await this.mediaCatalogRepository
            .remove(existingMedia)
            .then(() => {})
            .catch((onrejected) => {
                throw new HttpException(`${onrejected}`, HttpStatus.INTERNAL_SERVER_ERROR);
            });
    }
}
