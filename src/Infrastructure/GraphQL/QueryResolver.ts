import { Args, Query, Resolver } from "@nestjs/graphql";
import Media from "src/Core/Domains/Media";
import MediaDto from "src/Core/DTO/MediaDto";
import { MediaQuery } from "./Arguments";
import { InjectRepository } from "@nestjs/typeorm";
import { FilterOperators, Repository } from "typeorm";
import { QueryBuilderService } from "./Utils/Services/QueryBuilderService";
import { SortDirection, SortNulls } from "./Utils/Enums";
import { ConnectionType, Filter, FilterComparisons, FilterFieldComparison, FilterGrouping, Query as QueryArgs } from "./Utils/Interfaces";
import ValidatorRule from "src/Core/Shared/ValidatorRule";
import { HttpException, HttpStatus } from "@nestjs/common";
import { remapFilter } from "./Utils/Helpers/Filtering";



@Resolver()
export default class QueryResolver {
    private readonly mediaQueryBuilderService: QueryBuilderService<Media>;
    constructor (@InjectRepository(Media) private readonly mediaRepository: Repository<Media>) {
        this.mediaQueryBuilderService = new QueryBuilderService(this.mediaRepository);
    }
    
    @Query(() => MediaQuery.ConnectionType, { name: 'Media' })
    public async getMedia(@Args() query: MediaQuery): Promise<ConnectionType<MediaDto>> {
        console.log('\nQuery Order args:', JSON.stringify(query));
        const queryArgs: QueryArgs<Media> = {
            ...query,
            where: remapFilter<Media, MediaDto>(
                query.where ?? {},
                (key, value) => key === 'watched'
                    ? { users: { watched: value, user: { id: { eq: 1 } } } }
                    : undefined
            )
        };
        console.log('\nQuery Order args:', JSON.stringify(queryArgs));

        const totalCount = await this.mediaQueryBuilderService.getCount(query.where);
        const afterCursor = (query.after && Number(Buffer.from(query.after, 'base64').toString('ascii'))) ?? undefined;
        ValidatorRule
            .when(!afterCursor && (afterCursor <= 0 || afterCursor > totalCount))
            .triggerException(new HttpException('After cursor invalid.', HttpStatus.BAD_REQUEST));

        const beforeCursor = (query.before && Number(Buffer.from(query.before, 'base64').toString('ascii'))) ?? undefined;
        ValidatorRule
            .when(!beforeCursor && (beforeCursor <= 0 || beforeCursor > totalCount))
            .triggerException(new HttpException('Before cursor invalid.', HttpStatus.BAD_REQUEST));

        const result = await this.mediaQueryBuilderService.query(queryArgs);
        console.log('Query result:', result);
        
        return {
            totalCount: 0,
            pageInfo: {
                startCursor: "",
                hasNextPage: false,
                endCursor: "",
                hasPreviousPage: false
            },
            edges: []
        }
    }
}
