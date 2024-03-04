import { Controller, UseGuards, Sse, Get, Param, Post, Req, Inject, Delete, HttpException, HttpStatus, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiExcludeEndpoint, ApiExtraModels, ApiOkResponse, ApiTags, refs } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { Request } from 'express';
import MediaDto from 'src/Core/DTO/MediaDto';
import IMediaService from 'src/Infrastructure/Interfaces/Services/IMediaService';
import ApiTokenGuard from 'src/Infrastructure/Guards/ApiTokenGuard';
import SearchedMediaDto from 'src/Core/DTO/SearchedMediaDto';
import MediaTypes from 'src/Core/Types/Enums/MediaTypes';
import MovieMediaDto from 'src/Core/DTO/MovieMediaDto';
import TvMediaDto from 'src/Core/DTO/TvShowMediaDto';
import SetMediaDto from 'src/Core/DTO/setMediaDto';
import ValidatorRule from 'src/Core/Shared/ValidatorRule';

@Controller('media')
@ApiBearerAuth()
@UseGuards(ApiTokenGuard)
@ApiTags('Media Catalog')
export default class MediaCatalogController {
    constructor(
        @Inject('IMediaService')
        private readonly mediaService: IMediaService
    ) {}

    @Sse('catalog/tv/updated')
    @ApiExcludeEndpoint()
    getObservable(@Req() request: Request): Observable<MessageEvent<TvMediaDto>> {
        const userId = Number(request.headers['User-Id'] ?? request.headers['user-id']);
        return this.mediaService.getObservable(userId);
    }

    @Get('search/:title')
    @ApiOkResponse({ type: SearchedMediaDto, isArray: true })
    async fetchDetailsByTitle(@Param('title') title: string) {
        return await this.mediaService.fetchDetailsByTitle(title);
    }

    @Get('catalog/:id')
    @ApiOkResponse({ type: MediaDto })
    async findOneById(@Param('id') id: number, @Req() request: Request) {
        const userId = Number(request.headers['User-Id'] ?? request.headers['user-id']);
        return await this.mediaService.findOneById(id, userId);
    }

    @Post('catalog')
    @ApiExtraModels(MovieMediaDto, TvMediaDto)
    @ApiCreatedResponse({ schema: { oneOf: refs(MovieMediaDto, TvMediaDto) } })
    async markMedia(@Body() setMediaDto: SetMediaDto, @Req() request: Request) {
        ValidatorRule
            .when(!Object.values(MediaTypes).includes(setMediaDto.mediaType))
            .triggerException(new HttpException(
                `Unsupported media type: ${setMediaDto.mediaType}`,
                HttpStatus.BAD_REQUEST
            ));
        const userId = Number(request.headers['User-Id'] ?? request.headers['user-id']);
        return await this.mediaService.markMedia(setMediaDto.tmdbId, setMediaDto.watched, userId, setMediaDto.mediaType);
        /* switch (setMediaDto.mediaType) {
            case MediaTypes.Movie:
                return await this.mediaService.markMovieMedia(setMediaDto.id, setMediaDto.watched, userId);
            case MediaTypes.TvShow:
                return await this.mediaService.markTvMedia(setMediaDto.id, setMediaDto.watched, userId);
            default:
                throw new HttpException(`Unsupported media type: ${setMediaDto.mediaType}`, HttpStatus.BAD_REQUEST);
        } */
    }

    @Delete('catalog/:id')
    @ApiCreatedResponse({ type: SearchedMediaDto })
    async removeMedia(@Param('id') id: number, @Req() request: Request) {
        const userId = Number(request.headers['User-Id'] ?? request.headers['user-id']);
        return await this.mediaService.removeFromUserCatalog(id, userId);
    }
}
