import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import YouTubeNotifierDto from '../DTO/YouTubeNotifierDto';

@Entity({ name: 'youtube_notifier' })
export default class YouTubeNotifier {
    private static readonly arrayRegex = /^\[\s*(?:(?:"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\d+)\s*(?:,\s*(?:"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\d+)\s*)*)?\]$/;
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ default: '[]' })
    channelsToPost: string = '[]';

    updateYouTubeNotifier(youtubeNotifierDto: YouTubeNotifierDto) {
        this.id = youtubeNotifierDto.id;
        this.channelsToPost = youtubeNotifierDto.channelsToPost || "[]";
    }
}
