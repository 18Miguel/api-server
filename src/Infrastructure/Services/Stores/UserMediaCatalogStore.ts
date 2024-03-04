import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Mapper } from "ts-simple-automapper";
import { Repository } from "typeorm";
import { Transactional } from "typeorm-transactional";
import IUserMediaCatalogStore from "src/Infrastructure/Interfaces/Stores/IUserMediaCatalogStore";
import IUserStore from "src/Infrastructure/Interfaces/Stores/IUserStore";
import Media from "src/Core/Domains/Media";
import MediaDto from "src/Core/DTO/MediaDto";
import UserMediaCatalog from "src/Core/Domains/UserMediaCatalog";
import ValidatorRule from "src/Core/Shared/ValidatorRule";
import User from "src/Core/Domains/User";

@Injectable()
export default class UserMediaCatalogStore implements IUserMediaCatalogStore {
    constructor(
        @InjectRepository(UserMediaCatalog)
        private readonly userMediaCatalogRepository: Repository<UserMediaCatalog>,
        @InjectRepository(Media)
        private readonly mediaRepository: Repository<Media>,
        @Inject('IUserStore') private readonly userStore: IUserStore,
        @Inject('Mapper') private readonly mapper: Mapper,
    ) {}

    public async findUserMedia(id: number, userId: number): Promise<MediaDto> {
        const userMediaCatalog = await this.userMediaCatalogRepository.findOne({
            where: {
                user: { id: userId },
                media: { id: id },
            },
            relations: {
                user: true,
                media: true
            }
        });

        ValidatorRule
            .when(userMediaCatalog == null)
            .triggerException(new HttpException(
                'There is no media with the given media ID and user ID.',
                HttpStatus.BAD_REQUEST
            ));

        return this.mapper.map(userMediaCatalog.media, new MediaDto());
    }

    @Transactional()
    public async create(mediaDto: MediaDto, userId: number): Promise<MediaDto> {
        ValidatorRule
            .when(mediaDto.id &&
                (await this.mediaRepository
                    .findOneBy({id: mediaDto.id ?? 0 })) != null)
            .triggerException(new HttpException(
                'A media with the same ID already exists.',
                HttpStatus.BAD_REQUEST
            ));

        const existingUser = await this.userStore.findOneById(userId);

        ValidatorRule
            .when(!existingUser)
            .triggerException(new HttpException(
                'There is no user with the given ID.',
                HttpStatus.BAD_REQUEST
            ));

        let media = new Media();
        const userMediaCatalog = new UserMediaCatalog();

        media.updateMediaCatalog(mediaDto);
        media = await this.mediaRepository.save(media);

        userMediaCatalog.media = media;
        userMediaCatalog.user = this.mapper.map(existingUser, new User());
        userMediaCatalog.watched = mediaDto.watched || false;

        return await this.userMediaCatalogRepository
            .save(userMediaCatalog)
            .then((insertedMediaUser) => {
                const result = this.mapper.map(insertedMediaUser.media, new MediaDto());
                result.watched = insertedMediaUser.watched;
                return result;
            })
            .catch((onrejected) => {
                throw new HttpException(`${onrejected}`, HttpStatus.INTERNAL_SERVER_ERROR);
            });
    }

    @Transactional()
    public async update(id: number, mediaDto: MediaDto, userId: number): Promise<MediaDto> {
        ValidatorRule
            .when(id != mediaDto.id)
            .triggerException(new HttpException(
                'The provided media ID does not match the URL parameter ID.',
                HttpStatus.BAD_REQUEST
            ));

        const media = await this.mediaRepository.findOne({
            where: { id: (id || mediaDto.id) ?? -1 },
        });

        ValidatorRule
            .when(!media)
            .triggerException(new HttpException(
                'There is no media with the given ID.',
                HttpStatus.BAD_REQUEST
            ));

        const existingUser = await this.userStore.findOneById(userId);

        ValidatorRule
            .when(!existingUser)
            .triggerException(new HttpException(
                'There is no user with the given ID.',
                HttpStatus.BAD_REQUEST
            ));

        media.updateMediaCatalog(mediaDto);

        await this.mediaRepository.save(media)
            .catch((onrejected) => {
                throw new HttpException(`${onrejected}`, HttpStatus.INTERNAL_SERVER_ERROR);
            });

        const userMediaCatalog = await this.userMediaCatalogRepository.findOne({
            where: {
                user: { id: existingUser.id },
                media: { id: media.id }
            }
        }) ?? new UserMediaCatalog();

        userMediaCatalog.media = media;
        userMediaCatalog.user = this.mapper.map(existingUser, new User());
        userMediaCatalog.watched = mediaDto?.watched ?? false;
        
        return await this.userMediaCatalogRepository
            .save(userMediaCatalog)
            .then((updatedMediaUser) => {
                const result = this.mapper.map(updatedMediaUser.media, new MediaDto());
                result.watched = updatedMediaUser.watched;
                return result;
            })
            .catch((onrejected) => {
                throw new HttpException(`${onrejected}`, HttpStatus.INTERNAL_SERVER_ERROR);
            });
    }

    public async remove(id: number, userId: number): Promise<boolean> {
        const userMediaCatalog = await this.userMediaCatalogRepository.findOne({
            where: {
                user: { id: userId },
                media: { id: id },
            },
            relations: {
                user: true,
                media: true
            }
        });

        ValidatorRule
            .when(userMediaCatalog == null)
            .triggerException(new HttpException(
                'There is no media with the given media ID and user ID.',
                HttpStatus.BAD_REQUEST
            ));

        return await this.userMediaCatalogRepository
            .remove(userMediaCatalog)
            .then(() => true)
            .catch((onrejected) => {
                throw new HttpException(`${onrejected}`, HttpStatus.INTERNAL_SERVER_ERROR);
            });
    }
}
