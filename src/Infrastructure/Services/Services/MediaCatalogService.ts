import { HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Observable, Subject } from 'rxjs';
import { z } from 'zod';
import IMediaCatalogService from 'src/Infrastructure/Interfaces/Services/IMediaCatalogService';
import IMediaCatalogStore from 'src/Infrastructure/Interfaces/Stores/IMediaCatalogStore';
import MediaCatalogDto from 'src/Core/DTO/MediaCatalogDto';
import { envTMDBSchema } from 'src/Infrastructure/Settings/envTMDBSchema';
import SearchedMediaDto from 'src/Core/DTO/SearchedMediaDto';
import ValidatorRule from 'src/Core/Shared/ValidatorRule';
import MediaTypes from 'src/Core/Types/Enums/MediaTypes';
import searchDataSchema from 'src/Core/Schemas/SearchDataSchema';
import genreDataSchema from 'src/Core/Schemas/GenresDataSchema';
import movieDetailsDataSchema from 'src/Core/Schemas/MovieDetailsDataSchema';
import tvDetailsDataSchema from 'src/Core/Schemas/TvDetailsDataSchema';
import MovieMediaDto from 'src/Core/DTO/MovieMediaDto';
import TvMediaDto from 'src/Core/DTO/TvMediaDto';

@Injectable()
export default class MediaCatalogService implements IMediaCatalogService  {
    private static readonly tmdbBaseApiUri = 'https://api.themoviedb.org/3';
    private static readonly tmdbSearchMultiApiUri = '/search/multi';
    private static readonly tmdbGenreApiUri = (type: string) => `/genre/${type}/list`;
    private static readonly tmdbMovieApiUri = '/movie';
    private static readonly tmdbTvApiUri = '/tv';
    private readonly logger = new Logger(MediaCatalogService.name);
    private readonly subject = new Subject<MessageEvent<MediaCatalogDto>>();
    private readonly env: z.infer<typeof envTMDBSchema>;

    constructor(
        @Inject('IMediaCatalogStore')
        private readonly mediaCatalogStore: IMediaCatalogStore,
        private readonly configService: ConfigService<z.infer<typeof envTMDBSchema>>,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
    ) {
        this.env = envTMDBSchema.parse({
            TMDB_API_KEY: this.configService.get('TMDB_API_KEY'),
            TMDB_API_TOKEN: this.configService.get('TMDB_API_TOKEN')
        });

        this.updateTVShowsData();
    }
    
    @Cron(CronExpression.EVERY_MINUTE, { name: 'updateTVShowsData' })
    private updateTVShowsData(): void {
        this.logger.log('TV Show updated');
        this.logger.log(`TV Show observed? ${this.subject.observed.valueOf()}`);
        const mediaCatalogDto = new MediaCatalogDto();
        mediaCatalogDto.type = MediaTypes.Movie;
        mediaCatalogDto.title = "The Updated Movie - Part 96";
        this.sendData(mediaCatalogDto);
    }

    private async getGenreLabelsByIds(genreIds: Array<number>, type: string): Promise<Array<string>> {
        const genreLabels: Array<string> = [];

        if (!genreIds.length) return genreLabels;
        
        const response = await fetch(
            MediaCatalogService.tmdbBaseApiUri +
            MediaCatalogService.tmdbGenreApiUri(type), {
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
            searchMediaDto.id = result.id;
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

    private async mediaExist(id: number) {
        try {
            await this.mediaCatalogStore.findOne(id);
            return true;
        } catch (ignored) {
            return false;
        }
    }

    private createMediaCatalogDto(
        result: z.infer<typeof movieDetailsDataSchema | typeof tvDetailsDataSchema>,
        userId: number
    ): MediaCatalogDto {
        const mediaCatalogDto = new MediaCatalogDto();
        mediaCatalogDto.id = result.id;
        mediaCatalogDto.title = result['original_title'] || result['original_name'];
        mediaCatalogDto.releaseDate = new Date(result['release_date'] || result['first_air_date']);
        mediaCatalogDto.genres = result.genres.map(({ name }) => name).join(', ');
        mediaCatalogDto.numberOfEpisodes = result['number_of_episodes'] ?? null;
        mediaCatalogDto.inProduction = result['in_production'] ?? null;
        mediaCatalogDto.userId = userId;
        return mediaCatalogDto;
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

    async findOneById(id: number): Promise<MediaCatalogDto> {
        return await this.mediaCatalogStore.findOne(id);
    }

    async fetchDetailsByTitle(title: string): Promise<Array<SearchedMediaDto>> {
        const response = await fetch(
            MediaCatalogService.tmdbBaseApiUri +
            MediaCatalogService.tmdbSearchMultiApiUri +
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

    async markMovieMedia(id: number, watched: boolean, userId: number): Promise<MovieMediaDto> {
        const fetchUri = MediaCatalogService.tmdbBaseApiUri +
            MediaCatalogService.tmdbMovieApiUri + `/${id}`;
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

        const result = movieDetailsDataSchema.parse(data);
        let mediaCatalogDto = this.createMediaCatalogDto(result, userId);
        mediaCatalogDto.type = MediaTypes.Movie;
        mediaCatalogDto.watched = watched;

        mediaCatalogDto = !(await this.mediaExist(id))
            ? await this.mediaCatalogStore.create(mediaCatalogDto)
            : await this.mediaCatalogStore.update(id, mediaCatalogDto);

        const movieMediaDto = mediaCatalogDto as MovieMediaDto;
        movieMediaDto.runtime = result['runtime'];
        movieMediaDto.voteAverage = result['vote_average'];

        return movieMediaDto;
    }

    async markTvMedia(id: number, watched: boolean, userId: number): Promise<TvMediaDto> {
        const fetchUri = MediaCatalogService.tmdbBaseApiUri +
            MediaCatalogService.tmdbTvApiUri + `/${id}`;
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

        const result = tvDetailsDataSchema.parse(data);
        let mediaCatalogDto = this.createMediaCatalogDto(result, userId);
        mediaCatalogDto.type = MediaTypes.Tv;
        mediaCatalogDto.watched = watched;
        mediaCatalogDto = !(await this.mediaExist(id))
            ? await this.mediaCatalogStore.create(mediaCatalogDto)
            : await this.mediaCatalogStore.update(id, mediaCatalogDto);

        const tvMediaDto = mediaCatalogDto as TvMediaDto;
        tvMediaDto.lastAirDate = new Date(result['last_air_date']);
        tvMediaDto.numberOfSeasons = result['number_of_seasons'];
        tvMediaDto.voteAverage = result['vote_average'];

        return tvMediaDto;
    }

    async removeMedia(mediaId: number, userId: number): Promise<boolean> {
        // Check Cascade
        throw new Error('Method not implemented.');
    }
}
