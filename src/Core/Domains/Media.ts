import { Column, Entity, JoinColumn, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import ValidatorRule from '../Shared/ValidatorRule';
import { HttpException, HttpStatus } from '@nestjs/common';
import { MapProp } from 'ts-simple-automapper';
import UserMediaCatalog from './UserMediaCatalog';
import MediaDto from '../DTO/MediaDto';
import MediaTypes from '../Types/Enums/MediaTypes';

@Entity()
export default class Media {
    @PrimaryGeneratedColumn()
    @MapProp()
    public id: number;
    
    @Column()
    @MapProp()
    public tmdbId: number;

    @Column()
    @MapProp()
    public type: string;

    @Column()
    @MapProp()
    public title: string;

    @Column()
    @MapProp()
    public releaseDate: Date;

    @Column()
    @MapProp()
    public genres: string;

    @Column({ nullable: true, default: null })
    @MapProp()
    public posterPath?: string;

    @Column({ nullable: true, default: null })
    @MapProp()
    public numberOfEpisodes?: number = null;
    
    @Column({ nullable: true, default: null })
    @MapProp()
    public inProduction?: boolean = null;

    @OneToMany(() => UserMediaCatalog, userMediaCatalog => userMediaCatalog.media, { cascade: true })
    @JoinColumn()
    public users: Array<UserMediaCatalog>;

    updateMediaCatalog(mediaDto: MediaDto): void {
        ValidatorRule
            .when(typeof mediaDto.type !== 'string')
            .triggerException(new HttpException(
                'The type is required.',
                HttpStatus.BAD_REQUEST
            ));
        
        ValidatorRule
            .when(typeof mediaDto.title !== 'string')
            .triggerException(new HttpException(
                'The title is required.',
                HttpStatus.BAD_REQUEST
            ));
        
        ValidatorRule
            .when(!mediaDto.releaseDate)
            .when(typeof mediaDto.releaseDate == 'number')
            .when(!new Date(mediaDto.releaseDate).getTime())
            .triggerException(new HttpException(
                'The release date must be valid.',
                HttpStatus.BAD_REQUEST
            ));

        ValidatorRule
            .when(mediaDto.numberOfEpisodes &&
                mediaDto.numberOfEpisodes < 0)
            .triggerException(new HttpException(
                'The number of episodes must be greater than or equal to zero.',
                HttpStatus.BAD_REQUEST
            ));

        this.id = mediaDto.id;
        this.tmdbId = mediaDto.tmdbId;
        this.type = mediaDto.type;
        this.title = mediaDto.title;
        this.releaseDate = mediaDto.releaseDate;
        this.genres = mediaDto.genres ?? '';
        this.posterPath = mediaDto.posterPath ?? null;
        this.numberOfEpisodes = mediaDto.numberOfEpisodes ?? null;
        this.inProduction = mediaDto.inProduction ?? null;
    }
}
