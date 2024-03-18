import { Controller, Post, Body, Put, Delete, Inject, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import IAuthService from 'src/Infrastructure/Interfaces/Services/IAuthService';
import UserAuthDto from 'src/Core/DTO/UserAuthDto';
import UserCredentialsDto from 'src/Core/DTO/UserCredentialsDto';
import UserUpdateDto from 'src/Core/DTO/UserUpdateDto';
import ApiTokenGuard from 'src/Infrastructure/Guards/ApiTokenGuard';

@Controller('auth')
@ApiTags('Auth')
export default class AuthController {
    constructor(@Inject('IAuthService') private readonly authService: IAuthService) {}
    
    @Post('/register')
    @ApiCreatedResponse({ type: UserAuthDto })
    register(@Body() userCredentialsDto: UserCredentialsDto) {
        return this.authService.registerNewAccount(userCredentialsDto);
    }

    @Post('/login')
    @ApiOkResponse({ type: UserAuthDto })
    login(@Body() userCredentialsDto: UserCredentialsDto) {
        return this.authService.login(userCredentialsDto);
    }
    
    @Put('/update')
    @ApiBearerAuth()
    @UseGuards(ApiTokenGuard)
    @ApiCreatedResponse({ type: UserAuthDto })
    update(@Req() request: Request, @Body() userUpdateDto: UserUpdateDto) {
        const userId = Number(request.headers['User-Id'] ?? request.headers['user-id']);
        return this.authService.updateAccount(userId, userUpdateDto);
    }
    
    @Delete('/delete')
    @ApiBearerAuth()
    @UseGuards(ApiTokenGuard)
    @ApiOkResponse()
    delete(@Req() request: Request, @Body() userCredentialsDto: UserCredentialsDto) {
        const userId = Number(request.headers['User-Id'] ?? request.headers['user-id']);
        return this.authService.deleteAccount(userId, userCredentialsDto);
    }
}
