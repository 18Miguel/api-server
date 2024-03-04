import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common';
import IMediaStore from 'src/Infrastructure/Interfaces/Stores/IMediaStore';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Mapper } from 'ts-simple-automapper';
import Media from 'src/Core/Domains/Media';
import MediaDto from 'src/Core/DTO/MediaDto';
import ValidatorRule from 'src/Core/Shared/ValidatorRule';
import MediaTypes from 'src/Core/Types/Enums/MediaTypes';

@Injectable()
export default class MediaStore implements IMediaStore {
    constructor(
        @InjectRepository(Media)
        private readonly mediaRepository: Repository<Media>,
        @Inject('Mapper') private readonly mapper: Mapper,
    ) {}

    public async findMediaById(id: number): Promise<MediaDto> {
        const existingMedia = await this.mediaRepository.findOneBy({ id: id ?? 0 });

        ValidatorRule
            .when(existingMedia == null)
            .triggerException(new HttpException(
                'There is no media with the given ID.',
                HttpStatus.BAD_REQUEST
            ));

        return this.mapper.map(existingMedia, new MediaDto());
    }
    
    public async findMediaByTMDBId(tmdbId: number, type: MediaTypes): Promise<MediaDto> {
        ValidatorRule
            .when(!Object.values(MediaTypes).includes(type))
            .triggerException(new HttpException(
                'Please provide a valid media type.',
                HttpStatus.BAD_REQUEST
            ));

        const existingMedia = await this.mediaRepository.findOneBy({
            tmdbId: tmdbId ?? -1,
            type: type
        });

        ValidatorRule
            .when(!existingMedia)
            .triggerException(new HttpException(
                'There is no media with the given TMDB ID.',
                HttpStatus.BAD_REQUEST
            ));

        return this.mapper.map(existingMedia, new MediaDto());
    }

    public async getListOfTvShowsInProduction(): Promise<Array<Media> | null> {
        const listOfTvShowsInProduction = await this.mediaRepository.find({
            where: {
                type: MediaTypes.TvShow,
                inProduction: true,
            },
            relations: {
                users: {
                    media: true,
                    user: true
                }
            }
        });

        return listOfTvShowsInProduction.length > 0
            ? listOfTvShowsInProduction
            : null;
    }

    public async create(mediaDto: MediaDto): Promise<MediaDto> {
        ValidatorRule
            .when(mediaDto.id &&
                (await this.mediaRepository
                    .findOneBy({id: mediaDto.id ?? -1 })) != null)
            .triggerException(new HttpException(
                'A media with the same ID already exists.',
                HttpStatus.BAD_REQUEST
            ));

        const media = new Media();
        media.updateMediaCatalog(mediaDto);

        return await this.mediaRepository
            .save(media)
            .then((insertedMedia) =>
                this.mapper.map(insertedMedia, new MediaDto()))
            .catch((onrejected) => {
                throw new HttpException(`${onrejected}`, HttpStatus.INTERNAL_SERVER_ERROR);
            });
    }

    public async update(id: number, mediaDto: MediaDto): Promise<MediaDto> {
        ValidatorRule
            .when(id != mediaDto.id)
            .triggerException(new HttpException(
                'The provided media ID does not match the URL parameter ID.',
                HttpStatus.BAD_REQUEST
            ));

        const media = await this.mediaRepository
            .findOneBy({ id: mediaDto.id ?? -1 });

        ValidatorRule
            .when(!media)
            .triggerException(new HttpException(
                'There is no media with the given ID.',
                HttpStatus.BAD_REQUEST
            ));

            media.updateMediaCatalog(mediaDto);

        return await this.mediaRepository
            .save(media)
            .then((updatedMedia) => this.mapper.map(updatedMedia, new MediaDto()))
            .catch((onrejected) => {
                throw new HttpException(`${onrejected}`, HttpStatus.INTERNAL_SERVER_ERROR);
            });
    }

    public async remove(id: number): Promise<boolean> {
        const media = await this.mediaRepository
            .findOneBy({ id: id ?? -1 });

        ValidatorRule
            .when(!media)
            .triggerException(new HttpException(
                'There is no media with the given ID.',
                HttpStatus.BAD_REQUEST
            ));

        return await this.mediaRepository
            .remove(media)
            .then(() => true)
            .catch((onrejected) => {
                throw new HttpException(`${onrejected}`, HttpStatus.INTERNAL_SERVER_ERROR);
            });
    }
}
