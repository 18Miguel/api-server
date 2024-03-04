import { Args, Query, Resolver } from "@nestjs/graphql";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import MediaObjectType from "../DomainMap/MediaObjectType";
import { IEdgeType, PaginationArgs, paginateObject } from "../Utils";
import MediaFilterInput from "../DomainMap/MediaFilterInput";
import MediaDto from "src/Core/DTO/MediaDto";
import { Mapper } from "ts-simple-automapper";
import Media from "src/Core/Domains/Media";
import MediaSortInput from "../DomainMap/MediaSortInput";

@Resolver()
export default class QueryResolver {
    constructor(@InjectRepository(Media) private readonly mediaRepository: Repository<Media>) {}

    @Query(() => MediaObjectType, { name: 'Media' })
    public async getMedia(
        @Args() paginationArgs: PaginationArgs,
        @Args('where', { nullable: true }) filterArgs: MediaFilterInput,
        @Args('order', { nullable: true }) sortArgs: MediaSortInput,
    ): Promise<MediaObjectType> {
        console.log(JSON.stringify(filterArgs, null, 2), JSON.stringify(sortArgs, null, 2));
        const userId = 1;
        const query = this.mediaRepository
            .createQueryBuilder()
            .leftJoinAndSelect('Media.users', 'users')
            .leftJoinAndSelect('users.user', 'user')
            .where('user.id = :userId', { userId })
            .select();

        const result = await paginateObject(query, paginationArgs);
        const mediaEdges = result.edges.map(value => {
            const media = new Mapper().map(value.node, new MediaDto());
            media.watched = value.node.users.find(user => user.id = userId).watched;
            return { cursor: value.cursor, node: media } as IEdgeType<MediaDto>;
        });
        return { ...result, edges: mediaEdges };
    }
}