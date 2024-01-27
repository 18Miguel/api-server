import { Controller, UseGuards, Sse, Get, Param, Post, Body, Put, Delete } from '@nestjs/common';
import { ApiCreatedResponse, ApiExcludeEndpoint, ApiHeader, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import ApiKeyGuard from 'src/Infrastructure/Guards/ApiKeyGuard';
import MediaCatalogDto from 'src/Core/DTO/MediaCatalogDto';
import MediaCatalogService from 'src/Infrastructure/Services/Services/MediaCatalogService';

@Controller('media-catalog')
@UseGuards(ApiKeyGuard)
@ApiHeader({ name: 'X-API-Key', description: 'Enter your API key.' })
@ApiTags('Media Catalog')
export default class MediaCatalogController {
    constructor(
        private readonly mediaCatalogService: MediaCatalogService
    ) {}

    @Sse('updated')
    @ApiExcludeEndpoint()
    getObservable(): Observable<MessageEvent<MediaCatalogDto>> {
        return this.mediaCatalogService.getObservable();
    }

    @Get()
    @ApiOkResponse({
        type: MediaCatalogDto,
        isArray: true,
    })
    async findAll() {
        return await this.mediaCatalogService.findAll();
    }

    @Get(':id')
    @ApiOkResponse({ type: MediaCatalogDto })
    async findOne(@Param('id') id: number) {
        return await this.mediaCatalogService.findOne(id);
    }

    @Post()
    @ApiCreatedResponse({ type: MediaCatalogDto })
    create(@Body() mediaCatalogDto: MediaCatalogDto) {
        return this.mediaCatalogService.create(mediaCatalogDto);
    }

    @ApiOkResponse({ type: MediaCatalogDto })
    @Put(':id')
    update(@Param('id') id: number, @Body() mediaCatalogDto: MediaCatalogDto) {
        return this.mediaCatalogService.update(id, mediaCatalogDto);
    }

    @Delete(':id')
    @ApiOkResponse()
    remove(@Param('id') id: number) {
        return this.mediaCatalogService.remove(id);
    }
}
