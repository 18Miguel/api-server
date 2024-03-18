import { EntityMetadata, QueryBuilder, Repository, SelectQueryBuilder, WhereExpressionBuilder } from "typeorm"
import { ConnectionType, Filter, IEdgeType, Query, Sort } from "../Interfaces"
import { PageInfo, WhereBuilder } from "../Helpers"
import { merge } from "lodash"

/**
 * Interface that for Typeorm query builders that are sortable.
 */
interface Sortable<Entity> extends QueryBuilder<Entity> {
    addOrderBy(sort: string, order?: 'ASC' | 'DESC', nulls?: 'NULLS FIRST' | 'NULLS LAST'): this;
}

/**
 * Nested record type
 */
export interface NestedRecord<E = unknown> {
    [keys: string]: NestedRecord<E>;
}

/**
 * Class that will convert a Query into a `typeorm` Query Builder.
 */
export class QueryBuilderService<Entity> {
    private readonly whereBuilder: WhereBuilder<Entity>;

    constructor (private readonly entityRepository: Repository<Entity>) {
        this.whereBuilder = new WhereBuilder<Entity>();
    }

    private relationNames(): Array<string> {
        return this.entityRepository.metadata.relations
            .map((relationMetadata) => relationMetadata.propertyName);
    }

    private getFilterFields<DTO>(filter: Filter<DTO>): Array<string> {
        const fieldSet: Set<string> = Object.keys(filter).reduce((fields: Set<string>, filterField: string): Set<string> => {
            if (filterField === 'and' || filterField === 'or') {
                const andOrFilters = filter[filterField];
                if (andOrFilters !== undefined) {
                    return andOrFilters.reduce(
                        (andOrFields, andOrFilter) => new Set<string>([...andOrFields, ...this.getFilterFields(andOrFilter)]),
                        fields,
                    );
                }
            } else {
                fields.add(filterField);
            }
            return fields;
        }, new Set<string>());
        return [...fieldSet];
    };

    private getReferencedRelations(filter: Filter<Entity>): Array<string> {
        const relationNames = this.relationNames();
        const referencedFields = this.getFilterFields(filter);
        return referencedFields.filter((field) => relationNames.includes(field));
    }

    private getPageInfo(totalCount: number, query: Query<Entity>): PageInfo {
        let { first, after, last, before } = query;
        after = after ? Buffer.from(after, 'base64').toString('ascii') : undefined;
        before = before ? Buffer.from(before, 'base64').toString('ascii') : undefined;
        const pageInfo = new PageInfo();
        if (
            (first && (first <= 0)) ||
            (!after && (Number(after) <= 0 || Number(after) > totalCount)) ||
            ((last && last <= 0) || (last && !before)) ||
            (!before && (Number(before) <= 0 || Number(before) > totalCount))
        ) return pageInfo;

        let startingIndex: number | null = 1, endIndex: number | null = totalCount;
        if (first) {
            startingIndex = (Math.max(Number(after ?? 0), 0) + 1);
            endIndex = Math.min(first, totalCount);
            if (after) {
                if (startingIndex > totalCount)
                return pageInfo;
                endIndex = Math.min(Number(after) + first, totalCount);
            }
        
        } else if (last && before) {
            endIndex = Number(before) - 1;
            if (endIndex < 1)
                return pageInfo;
            startingIndex = Math.max(Number(before) - last, 1);
        }

        pageInfo.startCursor = Buffer.from(`${startingIndex}`).toString('base64');
        pageInfo.hasNextPage = Boolean(endIndex && endIndex < totalCount);
        pageInfo.endCursor = Buffer.from(`${endIndex}`).toString('base64');
        pageInfo.hasPreviousPage = Boolean(startingIndex && startingIndex > 1);
        return pageInfo;
    }

    /**
     * Create a `typeorm` SelectQueryBuilder which can be used as an entry point to create update, delete or insert
     * QueryBuilders.
     */
    public createQueryBuilder(): SelectQueryBuilder<Entity> {
        return this.entityRepository.createQueryBuilder();
    }
    
    /**
     * Query for multiple entities.
     *
     * @param query - The Query used to filter, page, and sort rows.
     * @see Query<Entity> for implementation details
     */
    public async query(query: Query<Entity>): Promise<Array<Entity>> {
        return (await this.select(query)).getMany();
    }

    public async createConnectionType(query: Query<Entity>): Promise<ConnectionType<Entity>> {
        const totalCount = await this.getCount(query.where);
        const pageInfo = this.getPageInfo(totalCount, query);
        const result = await this.query(query);
        const startCursor = pageInfo.startCursor
            ? Number(Buffer.from(pageInfo.startCursor, 'base64').toString('ascii')) : 1;
        const edges = result.map((element, index): IEdgeType<Entity> => ({
            cursor: Buffer.from(`${startCursor + index}`).toString('base64'),
            node: element,
        }));

        return {
            totalCount,
            pageInfo,
            edges,
        };
    }

    /**
     * Create a `typeorm` SelectQueryBuilder with `WHERE`, `ORDER BY` and `TAKE/SKIP` clauses.
     *
     * @param query - the query to apply.
     */
    public async select(query: Query<Entity>): Promise<SelectQueryBuilder<Entity>> {
        const hasRelations = this.filterHasRelations(query.where);
        let queryBuilder = this.createQueryBuilder();
        queryBuilder = hasRelations
            ? this.applyRelationJoinsRecursive(queryBuilder, this.getReferencedRelationsRecursive(this.entityRepository.metadata, query.where))
            : queryBuilder;
        queryBuilder = this.applyFilter(queryBuilder, query.where, queryBuilder.alias);
        queryBuilder = this.applySorting(queryBuilder, query.order, queryBuilder.alias);
        queryBuilder = await this.applyPaging(queryBuilder, query);

        return queryBuilder;
    }

    /**
     * Gets the count of entities matching the provided query.
     * 
     * @param query A query object that specifies the criteria for filtering entities.
     */
    public async getCount(filter?: Filter<Entity>): Promise<number> {
        const hasRelations = this.filterHasRelations(filter);
        let queryBuilder = this.createQueryBuilder();
        queryBuilder = hasRelations
            ? this.applyRelationJoinsRecursive(queryBuilder, this.getReferencedRelationsRecursive(this.entityRepository.metadata, filter))
            : queryBuilder;
        queryBuilder = this.applyFilter(queryBuilder, filter, queryBuilder.alias);
        return queryBuilder.getCount();
    }

    /**
     * Checks if a filter references any relations.
     * @param filter
     * @private
     *
     * @returns true if there are any referenced relations
     */
    public filterHasRelations(filter?: Filter<Entity>): boolean {
        return !filter ? false: (this.getReferencedRelations(filter).length > 0);
    }

    /**
     * Gets relations referenced in the filter and adds joins for them to the query builder
     * @param queryBuilder - the `typeorm` QueryBuilder.
     * @param relationsMap - the relations map.
     *
     * @returns the query builder for chaining
     */
    public applyRelationJoinsRecursive(
        queryBuilder: SelectQueryBuilder<Entity>,
        relationsMap?: NestedRecord,
        alias?: string,
    ): SelectQueryBuilder<Entity> {
        if (!relationsMap) return queryBuilder;

        const referencedRelations = Object.keys(relationsMap);
        return referencedRelations.reduce((rqb, relation) => {
            return this.applyRelationJoinsRecursive(
                rqb.leftJoinAndSelect(`${alias ?? rqb.alias}.${relation}`, relation),
                relationsMap[relation],
                relation,
            );
        }, queryBuilder);
    }

    public getReferencedRelationsRecursive(metadata: EntityMetadata, filterOrSort: Filter<unknown> | Sort<unknown> = {}): NestedRecord {
        const referencedFields = Array.from(new Set(Object.keys(filterOrSort) as Array<keyof Filter<unknown> | keyof Sort<unknown>>));
        return referencedFields.reduce((prev, curr) => {
            const currentValue = filterOrSort[curr];
            if ((curr === 'and' || curr === 'or') && currentValue) {
                for (const subFilter of currentValue) {
                    prev = merge(prev, this.getReferencedRelationsRecursive(metadata, subFilter));
                }
            }
            const referencedRelation = metadata.relations.find((r) => r.propertyName === curr);
            if (!referencedRelation) return prev;
            return {
                ...prev,
                [curr]: merge((prev as NestedRecord)[curr],
                    this.getReferencedRelationsRecursive(referencedRelation.inverseEntityMetadata, currentValue)),
            };
        }, {});
    }

    /**
     * Applies the filter from a Query to a `typeorm` QueryBuilder.
     *
     * @param queryBuilder - the `typeorm` QueryBuilder.
     * @param filter - the filter.
     * @param alias - optional alias to use to qualify an identifier
     */
    public applyFilter<Where extends WhereExpressionBuilder>(queryBuilder: Where, filter?: Filter<Entity>, alias?: string): Where {
        if (!filter) return queryBuilder;
        return this.whereBuilder.build(queryBuilder, filter, this.getReferencedRelationsRecursive(this.entityRepository.metadata, filter), alias);
    }

    /**
     * Applies the ORDER BY clause to a `typeorm` QueryBuilder.
     * @param queryBuilder - the `typeorm` QueryBuilder.
     * @param sorts - an array of SortFields to create the ORDER BY clause.
     * @param alias - optional alias to use to qualify an identifier
     */
    public applySorting<T extends Sortable<Entity>>(queryBuilder: T, sorts?: Sort<Entity>, alias?: string): T {
        if (!sorts) return queryBuilder;
        const relationNames = this.getReferencedRelationsRecursive(this.entityRepository.metadata, sorts);

        return Object.keys(sorts).reduce((prevQueryBuilder, sort) => {
            const data = sorts[sort];
            if (relationNames[sort as string]) return this.applySorting(prevQueryBuilder, data, sort);
            const col = alias ? `${alias}.${sort}` : `${sort}`;
            return prevQueryBuilder.addOrderBy(col, data.direction, data.nulls);
        }, queryBuilder);
    }

    /**
     * Applies paging to a Pageable `typeorm` query builder
     * @param queryBuilder - the `typeorm` QueryBuilder
     * @param query - query with the paging options.
     */
    public async applyPaging<T>(queryBuilder: SelectQueryBuilder<T>, query: Query<Entity>): Promise<SelectQueryBuilder<T> >{
        const totalCount = await this.getCount(query.where);
        console.log('Total count:', totalCount);

        if (query.first) {// FORWARD PAGINATION
            if (query.after) {
                const afterCursor = (query.after && Number(Buffer.from(query.after, 'base64').toString('ascii'))) ?? undefined;
                console.log('afterCursor:', afterCursor);
                queryBuilder = queryBuilder.skip(afterCursor);
            }
            queryBuilder = queryBuilder.take(query.first);

        } else if (query.last && query.before) {// REVERSE PAGINATION
            const beforeCursor = (query.before && Number(Buffer.from(query.before, 'base64').toString('ascii'))) ?? undefined;
            console.log('beforeCursor:', beforeCursor);
            if (beforeCursor <= 0 || beforeCursor > totalCount) return queryBuilder;
            const take = Math.min(query.last, beforeCursor - 1);
            const skip = beforeCursor === 1
                ? totalCount // Hack to get an empty list
                : Math.max(0, beforeCursor - query.last - 1);
            console.log('SKIP AND TAKE:', skip, take);
            queryBuilder = queryBuilder.skip(skip);
            queryBuilder = queryBuilder.take(take);
        }
        
        return queryBuilder;
    }
}