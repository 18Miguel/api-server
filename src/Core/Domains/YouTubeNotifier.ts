import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'youtube_notifier' })
export default class YouTubeNotifier {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ default: '[]' })
    channelsToPost: string = '[]';

    /* constructor(notifier?: YouTubeNotifier) {
        if (!notifier) return;
        
        this.id = notifier.id;
        this.channelsToPost = notifier.channelsToPost || "[]";
    } */
}
