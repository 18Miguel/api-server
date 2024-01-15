import { Controller, Get, Res } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { Response } from 'express';
import RootService from 'src/Infrastructure/Services/Services/RootService';

@Controller()
export default class RootController {
    constructor(private readonly rootService: RootService) {}

    @ApiExcludeEndpoint()
    @Get()
    rootPage(@Res() response: Response) {
        const htmlFile = this.rootService.getIndexHTMLFilepath();
        
        response.contentType('text/html');
        return response.sendFile(htmlFile);
    }
    
    @ApiExcludeEndpoint()
    @Get('/style.css')
    rootStyle(@Res() response: Response) {
        const cssFile = this.rootService.getCSSFilepath();
        
        response.contentType('text/css');
        return response.sendFile(cssFile);
    }
}
