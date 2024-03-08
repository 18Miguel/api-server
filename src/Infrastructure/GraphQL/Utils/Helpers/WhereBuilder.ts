import { Brackets, WhereExpressionBuilder } from "typeorm";
import { Filter, FilterComparisons, FilterFieldComparison } from "../Interfaces";
import { NestedRecord } from "../Services/QueryBuilderService";
import { EntityComparisonField, SQLComparisonBuilder } from ".";

/**
 * Builds a WHERE clause from a Filter.
 */
export class WhereBuilder<Entity> {
    constructor(readonly sqlComparisonBuilder: SQLComparisonBuilder<Entity> = new SQLComparisonBuilder<Entity>()) {}
  
    /**
     * Builds a WHERE clause from a Filter.
     * @param where - the `typeorm` WhereExpression
     * @param filter - the filter to build the WHERE clause from.
     * @param relationNames - the relations tree.
     * @param alias - optional alias to use to qualify an identifier
     */
    public build<Where extends WhereExpressionBuilder>(
      where: Where,
      filter: Filter<Entity>,
      relationNames: NestedRecord,
      alias?: string,
    ): Where {
        where = this.filterFields(where, filter, relationNames, alias);
        
        const { and, or } = filter;
        if (and && and.length) {
            this.filterAnd(where, and, relationNames, alias);
        }
        if (or && or.length) {
            this.filterOr(where, or, relationNames, alias);
        }
        return where;
    }
  
    /**
     * ANDs multiple filters together. This will properly group every clause to ensure proper precedence.
     *
     * @param where - the `typeorm` WhereExpression
     * @param filters - the array of filters to AND together
     * @param relationNames - the relations tree.
     * @param alias - optional alias to use to qualify an identifier
     */
    private filterAnd<Where extends WhereExpressionBuilder>(
        where: Where,
        filters: Array<Filter<Entity>>,
        relationNames: NestedRecord,
        alias?: string,
    ): Where {
        return where.andWhere(
            new Brackets((queryBuilder) =>
                filters.reduce((_, filter) =>
                    queryBuilder.andWhere(this.createBrackets(filter, relationNames, alias)), queryBuilder)));
    }
  
    /**
     * ORs multiple filters together. This will properly group every clause to ensure proper precedence.
     *
     * @param where - the `typeorm` WhereExpression
     * @param filters - the array of filters to OR together
     * @param relationNames - the relations tree.
     * @param alias - optional alias to use to qualify an identifier
     */
    private filterOr<Where extends WhereExpressionBuilder>(
        where: Where,
        filters: Array<Filter<Entity>>,
        relationNames: NestedRecord,
        alias?: string,
    ): Where {
        //console.log("filterOr", filters, where)
        return where.orWhere(
            new Brackets((queryBuilder) =>
                filters.reduce((_, filter) =>
                    queryBuilder.orWhere(this.createBrackets(filter, relationNames, alias)), queryBuilder))
        );
    }
  
    /**
     * Wraps a filter in brackes to ensure precedence.
     * ```
     * {a: { eq: 1 } } // "(a = 1)"
     * {a: { eq: 1 }, b: { gt: 2 } } // "((a = 1) AND (b > 2))"
     * ```
     * @param filter - the filter to wrap in brackets.
     * @param relationNames - the relations tree.
     * @param alias - optional alias to use to qualify an identifier
     */
    private createBrackets(filter: Filter<Entity>, relationNames: NestedRecord, alias?: string): Brackets {
        return new Brackets((queryBuilder) => this.build(queryBuilder, filter, relationNames, alias));
    }
  
    /**
     * Creates field comparisons from a filter. This method will ignore and/or properties.
     * @param where - the `typeorm` WhereExpression
     * @param filter - the filter with fields to create comparisons for.
     * @param relationNames - the relations tree.
     * @param alias - optional alias to use to qualify an identifier
     */
    private filterFields<Where extends WhereExpressionBuilder>(
        where: Where,
        filter: Filter<Entity>,
        relationNames: NestedRecord,
        alias?: string,
    ): Where {
        return Object.keys(filter).reduce((w, field) => {
            if (field !== 'and' && field !== 'or') {
                return this.withFilterComparison(
                    where,
                    field as keyof Entity,
                    this.getField(filter, field as keyof Entity),
                    relationNames,
                    alias,
                );
            }
            return w;
        }, where);
    }
  
    private getField<K extends keyof FilterComparisons<Entity>>(
        obj: FilterComparisons<Entity>,
        field: K,
    ): FilterFieldComparison<Entity[K]> {
        return obj[field] as FilterFieldComparison<Entity[K]>;
    }
  
    private withFilterComparison<T extends keyof Entity, Where extends WhereExpressionBuilder>(
        where: Where,
        field: T,
        cmp: FilterFieldComparison<Entity[T]>,
        relationNames: NestedRecord,
        alias?: string,
    ): Where {
        if (relationNames[field as string]) {
            return this.withRelationFilter(where, field, cmp as Filter<Entity[T]>, relationNames[field as string]);
        }
        return where.andWhere(
            new Brackets((queryBuilder) => {
                const opts = Object.keys(cmp) as Array<keyof FilterFieldComparison<Entity[T]>>;
                const sqlComparisons = opts.map((cmpType) =>
                    this.sqlComparisonBuilder.build(field, cmpType as any, cmp[cmpType] as EntityComparisonField<Entity, T>, alias),
                );
                sqlComparisons.map(({ sql, params }) => queryBuilder.orWhere(sql, params));
            }),
        );
    }
  
    private withRelationFilter<T extends keyof Entity, Where extends WhereExpressionBuilder>(
        where: Where,
        field: T,
        cmp: Filter<Entity[T]>,
        relationNames: NestedRecord,
    ): Where {
        return where.andWhere(
            new Brackets((queryBuilder) => {
                const relationWhere = new WhereBuilder<Entity[T]>();
                return relationWhere.build(queryBuilder, cmp, relationNames, field as string);
            }),
        );
    }
}
