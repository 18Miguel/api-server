import { Observable } from 'rxjs';
import MediaCatalogDto from 'src/Core/DTO/MediaCatalogDto';

export default interface IServerSentEventsService {
    getObservable(): Observable<MessageEvent<MediaCatalogDto>>;
    sendData(data: any): void;
}
