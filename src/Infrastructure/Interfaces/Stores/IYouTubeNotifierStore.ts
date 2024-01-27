import YouTubeNotifierDto from 'src/Core/DTO/YouTubeNotifierDto';

export default interface IYouTubeNotifierStore {
    findAll(): Promise<Array<YouTubeNotifierDto>>;
    findOne(id: number): Promise<YouTubeNotifierDto>;
    create(youtubeNotifierDto: YouTubeNotifierDto): Promise<YouTubeNotifierDto>;
    update(id: number, youtubeNotifierDto: YouTubeNotifierDto): Promise<YouTubeNotifierDto>;
    remove(id: number): Promise<void>;
}
