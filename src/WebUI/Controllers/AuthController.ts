import { Controller, Post, Body, Put, Delete, Param, Inject } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import IAuthService from 'src/Infrastructure/Interfaces/Services/IAuthService';
import UserAuthDto from 'src/Core/DTO/UserAuthDto';
import UserCredentialsDto from 'src/Core/DTO/UserCredentialsDto';
import UserUpdateDto from 'src/Core/DTO/UserUpdateDto';

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
    @ApiCreatedResponse({ type: UserAuthDto })
    update(@Body() userUpdateDto: UserUpdateDto) {
        return this.authService.updateAccount(userUpdateDto);
    }
    
    @Delete('/delete/:id')
    @ApiOkResponse()
    delete(@Param('id') id: number, @Body() userCredentialsDto: UserCredentialsDto) {
        return this.authService.deleteAccount(id, userCredentialsDto);
    }
}
