/* import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    Put
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import GuildDto from 'src/!Trash/GuildDto';
import GuildStore from 'src/Infrastructure/Services/Stores/GuildStore';

@Controller('guild')
@ApiTags('Discord Guilds')
export default class GuildController {
    constructor(
        private readonly guildStore: GuildStore
    ) {}

    @Get()
    @ApiOkResponse({
        type: GuildDto,
        isArray: true,
    })
    async findAll() {
        return await this.guildStore.findAll();
    }

    @Get(':id')
    @ApiOkResponse({ type: GuildDto })
    async findOne(@Param('id') id: number) {
        return await this.guildStore.findOne(id);
    }

    @Post()
    @ApiCreatedResponse({ type: GuildDto })
    create(@Body() guildDto: GuildDto) {
        return this.guildStore.create(guildDto);
    }

    @ApiOkResponse({ type: GuildDto })
    @Put(':id')
    update(@Param('id') id: number, @Body() guildDto: GuildDto) {
        return this.guildStore.update(id, guildDto);
    }

    @Delete(':id')
    @ApiOkResponse()
    remove(@Param('id') id: number) {
        return this.guildStore.remove(id);
    }
}
 */