import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import MediaCatalogDto from '../DTO/MediaCatalogDto';
import ValidatorRule from '../Shared/ValidatorRule';
import { HttpException, HttpStatus } from '@nestjs/common';

@Entity()
export default class MediaCatalog {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    type: string;

    @Column()
    title: string;

    @Column()
    releaseDate: Date;

    @Column()
    genres: string;

    @Column({ nullable: true, default: null })
    numberOfEpisodes?: number = null;

    @Column()
    watched: boolean;

    updateMediaCatalog(mediaCatalogDto: MediaCatalogDto): void {
        ValidatorRule
            .when(typeof mediaCatalogDto.type !== 'string')
            .triggerException(new HttpException(
                'The type is required.',
                HttpStatus.BAD_REQUEST
            ));
        
        ValidatorRule
            .when(typeof mediaCatalogDto.title !== 'string')
            .triggerException(new HttpException(
                'The title is required.',
                HttpStatus.BAD_REQUEST
            ));
        
        ValidatorRule
            .when(!mediaCatalogDto.releaseDate)
            .when(typeof mediaCatalogDto.releaseDate == 'number')
            .when(!new Date(mediaCatalogDto.releaseDate).getTime())
            .triggerException(new HttpException(
                'The release date must be valid.',
                HttpStatus.BAD_REQUEST
            ));

        ValidatorRule
            .when(mediaCatalogDto.numberOfEpisodes &&
                mediaCatalogDto.numberOfEpisodes < 0)
            .triggerException(new HttpException(
                'The number of episodes must be greater than or equal to zero.',
                HttpStatus.BAD_REQUEST
            ));

        ValidatorRule
            .when(mediaCatalogDto.watched === undefined)
            .when(mediaCatalogDto.watched === null)
            .when(typeof mediaCatalogDto.watched !== 'boolean')
            .triggerException(new HttpException(
                'Watched must be defined as a boolean.',
                HttpStatus.BAD_REQUEST
            ));

        this.id = mediaCatalogDto.id;
        this.type = mediaCatalogDto.type;
        this.title = mediaCatalogDto.title;
        this.releaseDate = mediaCatalogDto.releaseDate;
        this.genres = mediaCatalogDto.genres || '';
        this.numberOfEpisodes = mediaCatalogDto.numberOfEpisodes || null;
        this.watched = mediaCatalogDto.watched;
    }
}
