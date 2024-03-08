import { SortDirection, SortNulls } from "../Enums";

/**
 * Type to sort a field.
 */
export type SortField<T> = {
    [K in keyof T]?: {
        /**
         * The direction of the sort (ASC or DESC)
         */
        direction: SortDirection;
        /**
         * The order that nulls values should be sorted.
         */
        nulls?: SortNulls;
    }
}
