import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import IMediaCatalogStore from 'src/Infrastructure/Interfaces/Stores/IMediaCatalogStore';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import MediaCatalog from 'src/Core/Domains/MediaCatalog';
import MediaCatalogDto from 'src/Core/DTO/MediaCatalogDto';
import ObjectMapper from 'src/Core/shared/ObjectMapper';
import ValidatorRule from 'src/Core/shared/ValidatorRule';

@Injectable()
export default class MediaCatalogStore implements IMediaCatalogStore {
    constructor(
        @InjectRepository(MediaCatalog)
        private mediaCatalogRepository: Repository<MediaCatalog>,
    ) {}

    async findAll(): Promise<Array<MediaCatalogDto>> {
        return (await this.mediaCatalogRepository.find()).map((mediaCatalog) =>
            ObjectMapper.mapTo<MediaCatalogDto>(mediaCatalog));
    }

    async findOne(id: number): Promise<MediaCatalogDto> {
        const existingMedia = await this.mediaCatalogRepository.findOneBy({ id: id });

        ValidatorRule
            .when(existingMedia == null)
            .triggerException(new HttpException(
                'There is no media with the given ID.',
                HttpStatus.BAD_REQUEST
            ));

        return ObjectMapper.mapTo<MediaCatalogDto>(existingMedia);
    }

    async create(mediaCatalogDto: MediaCatalogDto): Promise<MediaCatalogDto> {
        ValidatorRule
            .when(mediaCatalogDto.id &&
                (await this.mediaCatalogRepository
                    .findOneBy({id: mediaCatalogDto.id })) != null)
            .triggerException(new HttpException(
                'A media with the same ID already exists.',
                HttpStatus.BAD_REQUEST
            ));

        const mediaCatalog = new MediaCatalog();

        mediaCatalog.updateMediaCatalog(mediaCatalogDto);

        return await this.mediaCatalogRepository
            .save(mediaCatalog)
            .then((insertedMedia) => ObjectMapper.mapTo<MediaCatalogDto>(insertedMedia))
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
            id: id || mediaCatalogDto.id,
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
            .then((updatedMedia) => ObjectMapper.mapTo<MediaCatalogDto>(updatedMedia))
            .catch((onrejected) => {
                throw new HttpException(`${onrejected}`, HttpStatus.INTERNAL_SERVER_ERROR);
            });
    }

    async remove(id: number): Promise<void> {
        const existingMedia = await this.mediaCatalogRepository.findOneBy({
            id: id,
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
