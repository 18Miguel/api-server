import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import YouTubeNotifierDto from "src/Core/DTO/YouTubeNotifierDto";
import YouTubeNotifier from "src/Core/Domains/YouTubeNotifier";
import ObjectMapper from "src/Core/Shared/ObjectMapper";
import ValidatorRule from "src/Core/Shared/ValidatorRule";
import IYouTubeNotifierStore from "src/Infrastructure/Interfaces/Stores/IYouTubeNotifierStore";
import { Mapper } from "ts-simple-automapper";
import { Repository } from "typeorm";

@Injectable()
export default class YouTubeNotifierStore implements IYouTubeNotifierStore {
    private readonly mapper: Mapper;

    constructor(
        @InjectRepository(YouTubeNotifier)
        private youtubeNotifierRepository: Repository<YouTubeNotifier>
    ) {
        this.mapper = new Mapper();
    }

    async findAll(): Promise<Array<YouTubeNotifierDto>> {
        return (await this.youtubeNotifierRepository.find()).map((youtubeNotifier) =>
            this.mapper.map(youtubeNotifier, new YouTubeNotifierDto()));
    }

    async findOne(id: number): Promise<YouTubeNotifierDto> {
        const existingYouTubeNotifier = await this.youtubeNotifierRepository.findOneBy({
            id: id
        });

        ValidatorRule
            .when(!existingYouTubeNotifier)
            .triggerException(new HttpException(
                'There is no YouTube notifier with the given ID.',
                HttpStatus.BAD_REQUEST
            ));

        return this.mapper.map(existingYouTubeNotifier, new YouTubeNotifierDto());
    }

    async create(youtubeNotifierDto: YouTubeNotifierDto): Promise<YouTubeNotifierDto> {
        ValidatorRule
            .when(youtubeNotifierDto.id &&
                (await this.youtubeNotifierRepository
                    .findOneBy({id: youtubeNotifierDto.id })) != null)
            .triggerException(new HttpException(
                'A YouTube notifier with the same ID already exists.',
                HttpStatus.BAD_REQUEST
            ));

        const youtubeNotifier = new YouTubeNotifier();

        youtubeNotifier.updateYouTubeNotifier(youtubeNotifierDto);

        return await this.youtubeNotifierRepository
            .save(youtubeNotifier)
            .then((insertedYouTubeNotifier) =>
                this.mapper.map(insertedYouTubeNotifier, new YouTubeNotifierDto()))
            .catch((onrejected) => {
                throw new HttpException(`${onrejected}`, HttpStatus.INTERNAL_SERVER_ERROR);
            });
    }

    async update(id: number, youtubeNotifierDto: YouTubeNotifierDto): Promise<YouTubeNotifierDto> {
        throw new Error("Method not implemented.");
    }

    async remove(id: number): Promise<void> {
        throw new Error("Method not implemented.");
    }
}
