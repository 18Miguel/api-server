import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiCreatedResponse, ApiHeader, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import UserDto from 'src/Core/DTO/UserDto';
import { Roles } from 'src/Core/Types/Decorator/Roles';
import UserRoles from 'src/Core/Types/Enums/UserRoles';
import UserStore from 'src/Infrastructure/Services/Stores/UserStore';

@Controller('user')
@ApiHeader({ name: 'X-API-Key', description: 'Enter your API key.' })
@ApiTags('Users')
export default class UserController {
    constructor(private readonly userStore: UserStore) {}

    @Get()
    @Roles(UserRoles.Admin, UserRoles.Bot)
    @ApiOkResponse({ type: UserDto, isArray: true })
    async findAll() {
        return await this.userStore.findAll();
    }

    @Get(':id')
    @ApiOkResponse({ type: UserDto })
    async findOneById(@Param('id') id: number) {
        return await this.userStore.findOneById(id);
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
