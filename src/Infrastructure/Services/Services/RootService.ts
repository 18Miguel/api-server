import { Injectable } from '@nestjs/common';
import { join } from 'path';
import IRootService from 'src/Infrastructure/Interfaces/Services/IRootServices';

@Injectable()
export default class RootService implements IRootService {
    getIndexHTMLFilepath(): string {
        return join(__dirname, '/../../..', '/WebUI/Public/index.html');
    }

    getCSSFilepath(): string {
        return join(__dirname, '/../../..', '/WebUI/Public/style.css');
    }
}
