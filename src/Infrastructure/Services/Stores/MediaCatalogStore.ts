import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common';
import IMediaCatalogStore from 'src/Infrastructure/Interfaces/Stores/IMediaCatalogStore';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Mapper } from 'ts-simple-automapper';
import { Transactional } from 'typeorm-transactional';
import MediaCatalog from 'src/Core/Domains/MediaCatalog';
import MediaCatalogDto from 'src/Core/DTO/MediaCatalogDto';
import ValidatorRule from 'src/Core/Shared/ValidatorRule';
import IUserStore from 'src/Infrastructure/Interfaces/Stores/IUserStore';
import User from 'src/Core/Domains/User';
import MediaCatalogUser from 'src/Core/Domains/MediaCatalogUser';

@Injectable()
export default class MediaCatalogStore implements IMediaCatalogStore {
    constructor(
        @InjectRepository(MediaCatalog)
        private readonly mediaCatalogRepository: Repository<MediaCatalog>,
        @InjectRepository(MediaCatalogUser)
        private readonly mediaCatalogUserRepository: Repository<MediaCatalogUser>,
        @Inject('IUserStore') private readonly userStore: IUserStore,
        @Inject('Mapper') private readonly mapper: Mapper,
    ) {}

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

    @Transactional()
    async create(mediaCatalogDto: MediaCatalogDto): Promise<MediaCatalogDto> {
        ValidatorRule
            .when(mediaCatalogDto.id &&
                (await this.mediaCatalogRepository
                    .findOneBy({id: mediaCatalogDto.id ?? 0 })) != null)
            .triggerException(new HttpException(
                'A media with the same ID already exists.',
                HttpStatus.BAD_REQUEST
            ));

        const existingUser = await this.userStore.findOneById(mediaCatalogDto.userId);

        ValidatorRule
            .when(!existingUser)
            .triggerException(new HttpException(
                'There is no user with the given ID.',
                HttpStatus.BAD_REQUEST
            ));

        let mediaCatalog = new MediaCatalog();
        const mediaCatalogUser = new MediaCatalogUser();

        mediaCatalog.updateMediaCatalog(mediaCatalogDto);
        mediaCatalog = await this.mediaCatalogRepository.save(mediaCatalog);

        mediaCatalogUser.mediaCatalog = mediaCatalog;
        mediaCatalogUser.user = this.mapper.map(existingUser, new User());
        mediaCatalogUser.watched = mediaCatalogDto.watched || false;

        return await this.mediaCatalogUserRepository
            .save(mediaCatalogUser)
            .then((insertedMediaUser) => {
                const result = this.mapper.map(insertedMediaUser.mediaCatalog, new MediaCatalogDto());
                result.watched = insertedMediaUser.watched;
                return result;
            })
            .catch((onrejected) => {
                throw new HttpException(`${onrejected}`, HttpStatus.INTERNAL_SERVER_ERROR);
            });
    }

    @Transactional()
    async update(id: number, mediaCatalogDto: MediaCatalogDto ): Promise<MediaCatalogDto> {
        ValidatorRule
            .when(id != mediaCatalogDto.id)
            .triggerException(new HttpException(
                'The provided media ID does not match the URL parameter ID.',
                HttpStatus.BAD_REQUEST
            ));

        const mediaCatalog = await this.mediaCatalogRepository.findOne({
            relations: { usersList: true },
            where: { id: (id || mediaCatalogDto.id) ?? 0 },
        });

        ValidatorRule
            .when(!mediaCatalog)
            .triggerException(new HttpException(
                'There is no media with the given ID.',
                HttpStatus.BAD_REQUEST
            ));

        const existingUser = await this.userStore.findOneById(mediaCatalogDto.userId);

        ValidatorRule
            .when(!existingUser)
            .triggerException(new HttpException(
                'There is no user with the given ID.',
                HttpStatus.BAD_REQUEST
            ));

        mediaCatalog.updateMediaCatalog(mediaCatalogDto);
        const mediaCatalogUser = await this.mediaCatalogUserRepository.findOne({
            where: {
                user: { id: existingUser.id },
                mediaCatalog: { id: mediaCatalog.id }
            }
        });
        mediaCatalogUser.id = mediaCatalogUser.id || undefined;
        mediaCatalogUser.mediaCatalog = mediaCatalog;
        mediaCatalogUser.user = this.mapper.map(existingUser, new User());
        mediaCatalogUser.watched = mediaCatalogDto.watched || false;
        
        return await this.mediaCatalogUserRepository
            .save(mediaCatalogUser)
            .then((updatedMediaUser) => {
                const result = this.mapper.map(updatedMediaUser.mediaCatalog, new MediaCatalogDto());
                result.watched = updatedMediaUser.watched;
                return result;
            })
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
