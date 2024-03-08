import { EntityMetadata, QueryBuilder, Repository, SelectQueryBuilder, WhereExpressionBuilder } from "typeorm"
import { Filter, Query, SortField } from "../Interfaces"
import { WhereBuilder } from "../Helpers"
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

    /**
     * Create a `typeorm` SelectQueryBuilder which can be used as an entry point to create update, delete or insert
     * QueryBuilders.
     */
    public createQueryBuilder(): SelectQueryBuilder<Entity> {
        return this.entityRepository.createQueryBuilder();
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
     * Query for multiple entities.
     *
     * @example
     * ```ts
     * const result = await this.queryBuilderService.query({ }: Query<Entity>);
     * ```
     * @param query - The Query used to filter, page, and sort rows.
     * @see Query<Entity> for implementation details
     */
    public async query(query: Query<Entity>): Promise<Array<Entity>> {
        return (await this.select(query)).getMany();
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
                rqb.leftJoin(`${alias ?? rqb.alias}.${relation}`, relation),
                relationsMap[relation],
                relation,
            );
        }, queryBuilder);
    }

    public getReferencedRelationsRecursive(metadata: EntityMetadata, filter: Filter<unknown> = {}): NestedRecord {
        const referencedFields = Array.from(new Set(Object.keys(filter) as (keyof Filter<unknown>)[]));
        return referencedFields.reduce((prev, curr) => {
            const currFilterValue = filter[curr];
            if ((curr === 'and' || curr === 'or') && currFilterValue) {
                for (const subFilter of currFilterValue) {
                    prev = merge(prev, this.getReferencedRelationsRecursive(metadata, subFilter));
                }
            }
            const referencedRelation = metadata.relations.find((r) => r.propertyName === curr);
            if (!referencedRelation) return prev;
            return {
                ...prev,
                [curr]: merge((prev as NestedRecord)[curr],
                    this.getReferencedRelationsRecursive(referencedRelation.inverseEntityMetadata, currFilterValue)),
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
    public applySorting<T extends Sortable<Entity>>(queryBuilder: T, sorts?: SortField<Entity>, alias?: string): T {
        if (!sorts) return queryBuilder;
        return Object.keys(sorts).reduce((prevQueryBuilder, field) => {
            const { direction, nulls } = sorts[field as keyof Entity]!;
            const col = alias ? `${alias}.${field}` : `${field}`;
            prevQueryBuilder = prevQueryBuilder.addOrderBy(col, direction, nulls);
            return prevQueryBuilder;
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
            console.log('SKIP AND TAKE:', skip, take, 'SKIP AND TAKE:', Math.max(0, beforeCursor - take - 1), Math.min(query.last, beforeCursor - 1));
            queryBuilder = queryBuilder.skip(skip);
            queryBuilder = queryBuilder.take(take);
        }
        
        return queryBuilder;
    }
}