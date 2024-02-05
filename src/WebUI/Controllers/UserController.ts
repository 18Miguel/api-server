import { Body, Controller, Delete, Get, Inject, Param, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Mapper } from 'ts-simple-automapper';
import UserDto from 'src/Core/DTO/UserDto';
import UserManageDto from 'src/Core/DTO/UserManageDto';
import { Roles } from 'src/Core/Types/Decorator/Roles';
import IUserStore from 'src/Infrastructure/Interfaces/Stores/IUserStore';
import UserRoles from 'src/Core/Types/Enums/UserRoles';

@Controller('user')
@ApiBearerAuth()
@ApiTags('Users')
export default class UserController {
    constructor(
        @Inject('IUserStore') private readonly userStore: IUserStore,
        @Inject('Mapper') private readonly mapper: Mapper
    ) {}

    @Get()
    @Roles(UserRoles.Admin, UserRoles.Manager)
    @ApiOkResponse({ type: UserDto, isArray: true })
    async findAll() {
        return await this.userStore.findAll();
    }

    @Get(':id')
    @Roles(UserRoles.Admin, UserRoles.Manager)
    @ApiOkResponse({ type: UserDto })
    async findOneById(@Param('id') id: number) {
        return await this.userStore.findOneById(id);
    }

    /* @Post()
    @Roles(UserRoles.Admin)
    @ApiCreatedResponse({ type: UserDto })
    create(@Body() userDto: UserDto) {
        return this.userStore.create(userDto);
    } */

    @Put('role/:id')
    @Roles(UserRoles.Admin)
    @ApiCreatedResponse({ type: UserDto })
    update(@Param('id') id: number, @Body() userManageDto: UserManageDto) {
        return this.userStore.update(id, this.mapper.map(userManageDto, new UserDto()));
    }

    @Delete(':id')
    @Roles(UserRoles.Admin)
    @ApiOkResponse()
    remove(@Param('id') id: number) {
        return this.userStore.remove(id);
    }
}
