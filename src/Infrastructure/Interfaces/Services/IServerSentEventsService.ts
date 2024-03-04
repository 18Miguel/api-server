import { Observable } from 'rxjs';
import MediaDto from 'src/Core/DTO/MediaDto';

export default interface IServerSentEventsService {
    getObservable(roomId: number): Observable<MessageEvent<MediaDto>>;
    sendData(roomId: number, data: any): void;
}
