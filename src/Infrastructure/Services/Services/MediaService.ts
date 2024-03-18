import { HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Observable, Subject } from 'rxjs';
import { z } from 'zod';
import IMediaService from 'src/Infrastructure/Interfaces/Services/IMediaService';
import IMediaStore from 'src/Infrastructure/Interfaces/Stores/IMediaStore';
import IUserMediaCatalogStore from 'src/Infrastructure/Interfaces/Stores/IUserMediaCatalogStore';
import MediaDto from 'src/Core/DTO/MediaDto';
import { envTMDBSchema } from 'src/Infrastructure/Settings/envTMDBSchema';
import SearchedMediaDto from 'src/Core/DTO/SearchedMediaDto';
import ValidatorRule from 'src/Core/Shared/ValidatorRule';
import MediaTypes from 'src/Core/Types/Enums/MediaTypes';
import searchDataSchema from 'src/Core/Schemas/SearchDataSchema';
import genreDataSchema from 'src/Core/Schemas/GenresDataSchema';
import movieDetailsDataSchema from 'src/Core/Schemas/MovieDetailsDataSchema';
import tvDetailsDataSchema from 'src/Core/Schemas/TvDetailsDataSchema';
import MovieMediaDto from 'src/Core/DTO/MovieMediaDto';
import TvShowMediaDto from 'src/Core/DTO/TvShowMediaDto';
import VideosDataSchema from 'src/Core/Schemas/VideosDataSchema';
import VideoDto from 'src/Core/DTO/VideoDto';
import { Mapper } from 'ts-simple-automapper';

@Injectable()
export default class MediaService implements IMediaService  {
    private static readonly tmdbBaseApiUri = 'https://api.themoviedb.org/3';
    private static readonly tmdbSearchMultiApiUri = '/search/multi';
    private static readonly tmdbMovieApiUri = '/movie';
    private static readonly tmdbTvApiUri = '/tv';
    private static readonly tmdbGenreApiUri = (type: string) => `/genre/${type}/list`;
    private static readonly tmdbVideosApiUri = (type: string, tmdbId: number | string) => `/${type}/${tmdbId}/videos`;
    private readonly logger: Logger;
    private readonly env: z.infer<typeof envTMDBSchema>;
    private readonly clientsSubject: Map<number, Subject<MessageEvent<MediaDto>>>;
    
    constructor(
        @Inject('IMediaStore') private readonly mediaStore: IMediaStore,
        @Inject('IUserMediaCatalogStore') private readonly userMediaCatalogStore: IUserMediaCatalogStore,
        private readonly configService: ConfigService<z.infer<typeof envTMDBSchema>>,
        @Inject('Mapper') private readonly mapper: Mapper,
    ) {
        this.env = envTMDBSchema.parse({
            TMDB_API_KEY: this.configService.get('TMDB_API_KEY'),
            TMDB_API_TOKEN: this.configService.get('TMDB_API_TOKEN')
        });
        this.logger = new Logger(MediaService.name);
        this.clientsSubject = new Map();

        /* this.mediaStore.findMediaByTMDBId(1399, MediaTypes.TvShow)
            .then(async (existingMedia) => {
                existingMedia.inProduction = true; existingMedia.numberOfEpisodes -= 10; 
                await this.mediaStore.update(existingMedia.id, existingMedia);
            })
            .catch(async (error) => console.error(error)); */
    }

    @Cron(CronExpression.EVERY_4_HOURS, { name: 'updateTVShowsData' })
    private async updateTVShowsData(): Promise<void> {
        const tvShowsList = await this.mediaStore.getListOfTvShowsInProduction();
        if (!tvShowsList) return;

        for (const tvShow of tvShowsList) {
            const data: z.infer<typeof tvDetailsDataSchema> = await this.fetchMediaData(tvShow.tmdbId, MediaTypes.TvShow);

            if (data.number_of_episodes > tvShow.numberOfEpisodes) {
                for (const { user } of tvShow.users) {
                    const tvMediaDto: TvShowMediaDto = await this.markMedia(tvShow.tmdbId, false, user.id, MediaTypes.TvShow);
                    this.sendData(user.id, tvMediaDto);
                }
            } else if (!data.in_production) {
                const mediaDto = this.createMediaDto(data);
                mediaDto.id = tvShow.id;
                mediaDto.type = MediaTypes.TvShow;
                await this.mediaStore.update(mediaDto.id, mediaDto);
            }
            this.logger.log(`TV Show ${tvShow.title} updated`);
        }
        this.logger.log(`Successfully updated ${tvShowsList.length} TV shows data`);
    }

    private async fetchMediaData(tmdbId: number, type: MediaTypes): Promise<z.infer<typeof movieDetailsDataSchema | typeof tvDetailsDataSchema>> {
        ValidatorRule
            .when(!Object.values(MediaTypes).includes(type))
            .triggerException(new HttpException(
                'Please provide a valid media type.',
                HttpStatus.BAD_REQUEST
            ));

        const fetchUri = MediaService.tmdbBaseApiUri +
            (type === MediaTypes.Movie
                ? MediaService.tmdbMovieApiUri
                : MediaService.tmdbTvApiUri) + `/${tmdbId}`;
        const response = await fetch(fetchUri, {
                method: 'GET',
                headers: {
                    accept: 'application/json',
                    Authorization: `Bearer ${this.env.TMDB_API_TOKEN}`
                }
            }
        );
        const data = await response.json();

        ValidatorRule
            .when(data['success'] == false)
            .triggerException(new HttpException(
                'Please ensure that your request includes appropriate parameters to indicate the intended content.',
                HttpStatus.BAD_REQUEST
            ));

        return type === MediaTypes.Movie
            ? movieDetailsDataSchema.parse(data)
            : tvDetailsDataSchema.parse(data);
    }

    private async getGenreLabelsByIds(genreIds: Array<number>, type: string): Promise<Array<string>> {
        const genreLabels: Array<string> = [];

        if (!genreIds.length) return genreLabels;
        
        const response = await fetch(
            MediaService.tmdbBaseApiUri +
            MediaService.tmdbGenreApiUri(type), {
                method: 'GET',
                headers: {
                    accept: 'application/json',
                    Authorization: `Bearer ${this.env.TMDB_API_TOKEN}`
                }
            }
        );
        const data = await response.json();
        const result = genreDataSchema.parse(data['genres']);
        genreIds.forEach(genreId => {
            const genre = result.find((item) => item.id === genreId);
            if (genre) genreLabels.push(genre.name);
        });

        return genreLabels;
    }

    private async getFilteredMediaResults(results: z.infer<typeof searchDataSchema>): Promise<Array<SearchedMediaDto>> {
        const mediaResults: Array<SearchedMediaDto> = [];
        
        for (const result of results) {
            if (mediaResults.length >= 5) break;
            if (!Object.values(MediaTypes).includes(result.media_type as MediaTypes)) continue;
            const genreLabels = await this.getGenreLabelsByIds(result.genre_ids, result.media_type);

            const searchMediaDto = new SearchedMediaDto();
            searchMediaDto.tmdbId = result.id;
            searchMediaDto.mediaType = result.media_type as MediaTypes;
            searchMediaDto.title = `${result.original_title || result.original_name}`;
            searchMediaDto.overview = result.overview;
            searchMediaDto.releaseDate = new Date(result.release_date || result.first_air_date);
            searchMediaDto.genres = genreLabels.join(', ');
            searchMediaDto.posterUriPath = result.poster_path
                ? `https://image.tmdb.org/t/p/original${result.poster_path}`
                : null;
            searchMediaDto.backdropUriPath = result.backdrop_path
                ? `https://image.tmdb.org/t/p/original${result.backdrop_path}`
                : null;
            mediaResults.push(searchMediaDto);
        }

        return mediaResults;
    }

    private async fetchVideos(type: string, tmdbId: number | string): Promise<Array<VideoDto>> {
        const response = await fetch(
            MediaService.tmdbBaseApiUri +
            MediaService.tmdbVideosApiUri(type, tmdbId), {
                method: 'GET',
                headers: {
                    accept: 'application/json',
                    Authorization: `Bearer ${this.env.TMDB_API_TOKEN}`
                }
            }
        );
        const data = await response.json();
        const result = VideosDataSchema.parse(data);
        
        const trailers = result.results.filter(video => video.type === 'Trailer').slice(0, 5);
        const teasers = result.results.filter(video => video.type === 'Teaser').slice(0, 5);
        const videos = [...trailers, ...teasers].map((video) => {
            const videoDto = this.mapper.map(video, new VideoDto());
            videoDto.publishedAt = new Date(video.published_at);
            return videoDto;
        });

        return videos;
    }

    private createMediaDto(
        result: z.infer<typeof movieDetailsDataSchema | typeof tvDetailsDataSchema>
    ): MediaDto {
        const mediaDto = new MediaDto();
        mediaDto.tmdbId = result.id;
        mediaDto.title = result['original_title'] || result['original_name'];
        mediaDto.overview = result.overview;
        mediaDto.releaseDate = new Date(result['release_date'] || result['first_air_date']);
        mediaDto.genres = result.genres.map(({ name }) => name)
            .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())).join(', ');
        mediaDto.posterPath = result.poster_path
            ? `https://image.tmdb.org/t/p/original${result.poster_path}`
            : null;
        mediaDto.backdropPath = result.backdrop_path
            ? `https://image.tmdb.org/t/p/original${result.backdrop_path}`
            : null;
        mediaDto.voteAverage = result.vote_average;
        mediaDto.inProduction = result['in_production'] ?? null;
        mediaDto.numberOfEpisodes = result['number_of_episodes'] ?? null;
        return mediaDto;
    }

    public getObservable(userId: number): Observable<MessageEvent<TvShowMediaDto>> {
        if (!this.clientsSubject.has(userId)) {
            const subject = new Subject<MessageEvent<MediaDto>>();
            this.clientsSubject.set(userId, subject);
            return subject.asObservable();
        }

        const clientSubject = this.clientsSubject.get(userId);
        return clientSubject.asObservable();
    }

    public sendData(userId: number, data: TvShowMediaDto): void {
        this.clientsSubject.get(userId)
            ?.next(new MessageEvent('message', { data }));
    }

    public async findOneById(mediaId: number, userId: number): Promise<MediaDto> {
        return await this.userMediaCatalogStore.findUserMedia(mediaId, userId);
    }

    public async fetchDetailsByTitle(title: string): Promise<Array<SearchedMediaDto>> {
        const response = await fetch(
            MediaService.tmdbBaseApiUri +
            MediaService.tmdbSearchMultiApiUri +
            `?query=${title}&include_adult=true`, {
                method: 'GET',
                headers: {
                    accept: 'application/json',
                    Authorization: `Bearer ${this.env.TMDB_API_TOKEN}`
                }
            }
        );
        const data = await response.json();
        const results = searchDataSchema.parse((data['results'] as Array<any>).slice(0, 10));
        const mediaResults = await this.getFilteredMediaResults(results);

        ValidatorRule
            .when(!mediaResults.length)
            .triggerException(new HttpException(
                'The server cannot produce a response matching the criteria specified in the request.\r\n' +
                'Please ensure that your request includes appropriate parameters to indicate the acceptable content.',
                HttpStatus.NOT_ACCEPTABLE
            ));
        
        return mediaResults;
    }

    public async markMedia(tmdbId: number, watched: boolean = false, userId: number, type: MediaTypes): Promise<MovieMediaDto | TvShowMediaDto> {
        const result = await this.fetchMediaData(tmdbId, type);
        let mediaDto = this.createMediaDto(result);
        mediaDto.type = type;
        mediaDto.watched = watched;

        await this.mediaStore.findMediaByTMDBId(tmdbId, type)
            .then(async (existingMedia) => {
                mediaDto.id = existingMedia.id;
                mediaDto = await this.userMediaCatalogStore.update(mediaDto.id, mediaDto, userId);
            })
            .catch(async () => {
                mediaDto = await this.userMediaCatalogStore.create(mediaDto, userId);
            });

        switch (type) {
            case MediaTypes.Movie: {
                const _result = result as z.infer<typeof movieDetailsDataSchema>;
                mediaDto['runtime'] = _result.runtime;
                break;
            }
            case MediaTypes.TvShow: {
                const _result = result as z.infer<typeof tvDetailsDataSchema>;
                mediaDto['lastAirDate'] = new Date(_result.last_air_date);
                mediaDto['numberOfSeasons'] = _result.number_of_seasons;
                break;
            }
        }
        mediaDto['videos'] = await this.fetchVideos(type, tmdbId);

        return mediaDto;
    }

    public async removeFromUserCatalog(mediaId: number, userId: number): Promise<boolean> {
        return await this.userMediaCatalogStore.remove(mediaId, userId);
    }
}
