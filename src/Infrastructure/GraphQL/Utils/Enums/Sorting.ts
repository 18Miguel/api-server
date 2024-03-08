import { registerEnumType } from "@nestjs/graphql";

/**
 * Enum for sorting either ASC or DESC.
 */
export enum SortDirection {
    ASC = "ASC",
    DESC = "DESC"
}
registerEnumType(SortDirection, {
    name: 'SortDirection',
    description: 'Sort Directions',
});

/**
 * Null sort option.
 */
export enum SortNulls {
    /**
     * All nulls will be first.
     */
    NULLS_FIRST = "NULLS FIRST",
    /**
     * All nulls will be last.
     */
    NULLS_LAST = "NULLS LAST"
}
registerEnumType(SortNulls, {
    name: 'SortNulls',
    description: 'Sort Nulls Options',
});
