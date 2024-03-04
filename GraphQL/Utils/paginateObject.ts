import { Logger } from "@nestjs/common";
import { SelectQueryBuilder, MoreThan, LessThan } from "typeorm";
import { IObjectType, PaginationArgs } from ".";
import PageInfo from "./Mapper/PageInfo";

export async function paginateObject<T>(
    query: SelectQueryBuilder<T>,
    paginationArgs: PaginationArgs,
    cursorColumn = 'id',
): Promise<IObjectType<T>> {
    const logger = new Logger('Pagination');

    query.orderBy({ [`${query.alias}.${cursorColumn}`]: 'ASC' });
    const totalCountQuery = query.clone();

    if (paginationArgs.first) {// FORWARD pagination
        if (paginationArgs.after) {
            const offsetId = Number(Buffer.from(paginationArgs.after, 'base64').toString('ascii'));
            logger.verbose(`Paginate AfterID: ${offsetId}`);
            query.where({ [`${query.alias}.${cursorColumn}`]: MoreThan(offsetId) });
        }
        const limit = paginationArgs.first ?? undefined;
        query.take(limit);
    
    } else if (paginationArgs.last && paginationArgs.before) {// REVERSE pagination
        const offsetId = Number(Buffer.from(paginationArgs.before, 'base64').toString('ascii'));
        logger.verbose(`Paginate BeforeID: ${offsetId}`);
        const limit = paginationArgs.last ?? undefined;

        query.where({ [`${query.alias}.${cursorColumn}`]: LessThan(offsetId) }).take(limit);
    }

    const result = await query.getMany();
    const startCursorId: number = result.length > 0 ? result[0][cursorColumn] : null;
    const endCursorId: number = result.length > 0 ? result.slice(-1)[0][cursorColumn] : null;
    const beforeQuery = totalCountQuery.clone();
    const afterQuery = beforeQuery.clone();
    let countBefore = 0, countAfter = 0;

    if (beforeQuery.expressionMap.wheres && beforeQuery.expressionMap.wheres.length) {
        countBefore = await beforeQuery
            .andWhere(`${query.alias}.${cursorColumn} < :cursor`, { cursor: startCursorId })
            .getCount();
        countAfter = await afterQuery
            .andWhere(`${query.alias}.${cursorColumn} > :cursor`, { cursor: endCursorId })
            .getCount();

    } else {
        countBefore = await beforeQuery
            .where(`${query.alias}.${cursorColumn} < :cursor`, { cursor: startCursorId })
            .getCount();

        countAfter = await afterQuery
            .where(`${query.alias}.${cursorColumn} > :cursor`, { cursor: endCursorId })
            .getCount();
    }

    logger.debug(`CountBefore: ${countBefore}, CountAfter: ${countAfter}`);

    const edges = result.map((value) => ({
        node: value,
        cursor: Buffer.from(`${value[cursorColumn]}`).toString('base64'),
    }));

    const pageInfo = new PageInfo();
    pageInfo.startCursor = edges.length > 0 ? edges[0].cursor : null;
    pageInfo.endCursor = edges.length > 0 ? edges.slice(-1)[0].cursor : null;
    pageInfo.hasNextPage = countAfter > 0;
    pageInfo.hasPreviousPage = countBefore > 0;
    const totalCount = countAfter + countBefore + edges.length;

    return { totalCount, pageInfo, edges };
}