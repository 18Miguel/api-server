import { Args, Context, Query, Resolver } from "@nestjs/graphql";
import Media from "src/Core/Domains/Media";
import MediaDto from "src/Core/DTO/MediaDto";
import { MediaQuery } from "./Arguments";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { QueryBuilderService } from "./Utils/Services/QueryBuilderService";
import { ConnectionType, Filter, IEdgeType, Query as QueryArgs } from "./Utils/Interfaces";
import ValidatorRule from "src/Core/Shared/ValidatorRule";
import { HttpException, HttpStatus, UseGuards } from "@nestjs/common";
import { remapFilter } from "./Utils/Helpers/Filtering";
import { remapSort } from "./Utils/Helpers/RemapSort";
import { merge } from "lodash";
import ApiTokenGuard from "../Guards/ApiTokenGuard";

@Resolver()
export default class QueryResolver {
    private readonly mediaQueryBuilderService: QueryBuilderService<Media>;
    constructor (@InjectRepository(Media) private readonly mediaRepository: Repository<Media>) {
        this.mediaQueryBuilderService = new QueryBuilderService(this.mediaRepository);
    }
    
    @UseGuards(ApiTokenGuard)
    @Query(() => MediaQuery.ConnectionType, { name: 'Media' })
    public async getMedia(@Args() query: MediaQuery, @Context() context: any): Promise<ConnectionType<MediaDto>> {
        const userId = Number((context.req as Request).headers['User-Id'] ?? 0);
        const queryArgs: QueryArgs<Media> = {
            ...query,
            where: merge<Filter<Media>, Filter<Media>>(
                { users: { user: { id: { eq: userId } } } },
                remapFilter<Media, MediaDto>(
                    query.where,
                    (key, value) => key === 'watched' ? { users: { watched: value } } : undefined
                )
            ),
            order: remapSort<Media, MediaDto>(
                query.order,
                (key, value) => key === 'watched' ? { users: { watched: value } } : undefined
            ),
        };

        const totalCount = await this.mediaQueryBuilderService.getCount(query.where);
        const afterCursor = (query.after && Number(Buffer.from(query.after, 'base64').toString('ascii'))) ?? undefined;
        ValidatorRule
            .when(!afterCursor && (afterCursor <= 0 || afterCursor > totalCount))
            .triggerException(new HttpException('After cursor invalid.', HttpStatus.BAD_REQUEST));

        const beforeCursor = (query.before && Number(Buffer.from(query.before, 'base64').toString('ascii'))) ?? undefined;
        ValidatorRule
            .when(!beforeCursor && (beforeCursor <= 0 || beforeCursor > totalCount))
            .triggerException(new HttpException('Before cursor invalid.', HttpStatus.BAD_REQUEST));

        const result = await this.mediaQueryBuilderService.createConnectionType(queryArgs);
        result.edges = result.edges.map((media) => ({
            cursor: media.cursor,
            node: {
                ...media.node,
                ...{ watched: media.node.users[0].watched }
            }
        } as unknown as IEdgeType<Media>))
        return result as unknown as Promise<ConnectionType<MediaDto>>;
    }
}
