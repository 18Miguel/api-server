import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    Put
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import UserDto from 'src/Core/DTO/UserDto';
import UserStore from 'src/Infrastructure/Services/Stores/UserStore';

@Controller('user')
@ApiTags('Users')
export default class UserController {
    constructor(
        private readonly userStore: UserStore
    ) {}

    @Get()
    @ApiOkResponse({
        type: UserDto,
        isArray: true,
    })
    async findAll() {
        return await this.userStore.findAll();
    }

    @Get(':id')
    @ApiOkResponse({ type: UserDto })
    async findOne(@Param('id') id: number) {
        return await this.userStore.findOne(id);
    }

    @Post()
    @ApiCreatedResponse({ type: UserDto })
    create(@Body() userDto: UserDto) {
        return this.userStore.create(userDto);
    }

    @ApiOkResponse({ type: UserDto })
    @Put(':id')
    update(@Param('id') id: number, @Body() userDto: UserDto) {
        return this.userStore.update(id, userDto);
    }

    @Delete(':id')
    @ApiOkResponse()
    remove(@Param('id') id: number) {
        return this.userStore.remove(id);
    }
}
