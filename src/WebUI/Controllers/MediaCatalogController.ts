import { Controller, UseGuards, Sse, Get, Param, Post, Req, Inject, Delete, HttpException, HttpStatus, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiExcludeEndpoint, ApiExtraModels, ApiOkResponse, ApiParam, ApiQuery, ApiTags, refs } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { Request } from 'express';
import MediaCatalogDto from 'src/Core/DTO/MediaCatalogDto';
import IMediaCatalogService from 'src/Infrastructure/Interfaces/Services/IMediaCatalogService';
import ApiTokenGuard from 'src/Infrastructure/Guards/ApiTokenGuard';
import SearchedMediaDto from 'src/Core/DTO/SearchedMediaDto';
import MovieMediaDto from 'src/Core/DTO/MovieMediaDto';
import TvMediaDto from 'src/Core/DTO/TvMediaDto';
import MediaTypes from 'src/Core/Types/Enums/MediaTypes';
import { boolean } from 'zod';

@Controller('media-catalog')
@ApiBearerAuth()
@UseGuards(ApiTokenGuard)
@ApiTags('Media Catalog')
export default class MediaCatalogController {
    constructor(
        @Inject('IMediaCatalogService')
        private readonly mediaCatalogService: IMediaCatalogService
    ) {}

    @Sse('updated')
    @ApiExcludeEndpoint()
    getObservable(): Observable<MessageEvent<MediaCatalogDto>> {
        return this.mediaCatalogService.getObservable();
    }

    @Get()
    @ApiOkResponse({ type: MediaCatalogDto, isArray: true })
    async findAll() {
        return await this.mediaCatalogService.findAll();
    }

    @Get(':id')
    @ApiOkResponse({ type: MediaCatalogDto })
    async findOneById(@Param('id') id: number) {
        return await this.mediaCatalogService.findOneById(id);
    }
    
    @Get('search/:title')
    @ApiOkResponse({ type: SearchedMediaDto, isArray: true })
    async fetchDetailsByTitle(@Param('title') title: string) {
        return await this.mediaCatalogService.fetchDetailsByTitle(title);
    }

    @Post('mark/:media_type/:id')
    @ApiExtraModels(MovieMediaDto, TvMediaDto)
    @ApiCreatedResponse({ schema: { anyOf: refs(MovieMediaDto, TvMediaDto) } })
    @ApiParam({ name: 'media_type', enum: MediaTypes })
    @ApiQuery({ name: 'watched', type: Boolean, required: false, description: 'Default value: false' })
    async markMedia(
        @Param('media_type') mediaType: MediaTypes,
        @Param('id') id: number,
        @Query('watched') watched: string = 'false',
        @Req() request: Request
    ) {
        const userId = Number(request.headers['User-Id'] ?? request.headers['user-id']);
        switch (mediaType) {
            case MediaTypes.Movie:
                return await this.mediaCatalogService.markMovieMedia(id, watched === 'true', userId);
            case MediaTypes.Tv:
                return await this.mediaCatalogService.markTvMedia(id, watched === 'true', userId);
            default:
                throw new HttpException(`Unsupported media type: ${mediaType}`, HttpStatus.BAD_REQUEST);
        }
    }
    @Delete('remove/:id')
    @ApiCreatedResponse({ type: SearchedMediaDto })
    async removeMedia(@Param('id') id: number, @Req() request: Request) {
        const userId = Number(request.headers['User-Id'] ?? request.headers['user-id']);
        return await this.mediaCatalogService.removeMedia(id, userId);
    }

    /* @Post()
    @ApiCreatedResponse({ type: MediaCatalogDto })
    create(@Body() mediaCatalogDto: MediaCatalogDto, @Req() request: Request) {
        mediaCatalogDto.userId = Number(request.headers['User-Id'] ?? request.headers['user-id']);
        return //this.mediaCatalogService.addMedia(mediaCatalogDto);
    } */

    /* @ApiCreatedResponse({ type: MediaCatalogDto })
    @Put(':id')
    update(@Param('id') id: number, @Body() mediaCatalogDto: MediaCatalogDto, @Req() request: Request) {
        mediaCatalogDto.userId = Number(request.headers['User-Id'] ?? request.headers['user-id']);
        //return this.mediaCatalogService.update(id, mediaCatalogDto);
    } */

    /* @Delete(':id')
    @ApiOkResponse()
    remove(@Param('id') id: number) {
        //return this.mediaCatalogService.remove(id);
    } */
}
