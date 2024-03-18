import { SortDirection, SortNulls } from "../Enums";

/**
 * Interface to sort a field.
*/
export interface SortField {
    /**
     * The direction of the sort (ASC or DESC)
    */
   direction: SortDirection;
   /**
    * The order that nulls values should be sorted.
   */
  nulls?: SortNulls;
}

type BuiltInTypes = boolean | Boolean | string | String | number | Number | Date | RegExp | bigint | symbol | null | undefined | never;
export type SortFieldOrderType<FieldType> =
FieldType extends Function ? undefined
: FieldType extends Array<infer U> ? Sort<U> 
: FieldType extends BuiltInTypes ? SortField
: FieldType extends infer U ? Sort<U> : SortField;

export type Sort<T> = {
    [K in keyof T]?: SortFieldOrderType<T[K]>;
}
