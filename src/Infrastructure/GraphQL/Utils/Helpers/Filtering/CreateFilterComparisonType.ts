import { Type as ClassType } from "@nestjs/common";
import { ReturnTypeFuncValue, Int, Float, ID, GraphQLISODateTime, GraphQLTimestamp, ReturnTypeFunc, TypeMetadataStorage, InputType, Field } from "@nestjs/graphql";
import { EnumMetadata } from "@nestjs/graphql/dist/schema-builder/metadata";
import { LazyMetadataStorage } from "@nestjs/graphql/dist/schema-builder/storages/lazy-metadata.storage";
import { Type } from "class-transformer";
import { IsBoolean, IsOptional } from "class-validator";
import { FilterFieldComparison, FilterComparisonOperators } from "../../Interfaces";
import { IsUndefined } from "../../Decorators/IsUndefined";
import { getOrCreateBooleanFieldComparison } from "./BooleanFieldComparisonInputType";
import { getOrCreateDateFieldComparison } from "./DateFieldComparisonInputType";
import { getOrCreateFloatFieldComparison } from "./FloatFieldComparisonInputType";
import { getOrCreateIntFieldComparison } from "./IntFieldComparisonInputType";
import { getOrCreateNumberFieldComparison } from "./NumberFieldComparisonInputType";
import { getOrCreateStringFieldComparison } from "./StringFieldComparisonInputType";
import { getOrCreateTimestampFieldComparison } from "./TimestampFieldComparisonInputType";
import { SkipIf } from "../../Decorators/SkipIf";

const filterComparisonMap = new Map<string, () => ClassType<FilterFieldComparison<unknown>>>();
filterComparisonMap.set('StringFilterComparison', getOrCreateStringFieldComparison);
filterComparisonMap.set('NumberFilterComparison', getOrCreateNumberFieldComparison);
filterComparisonMap.set('IntFilterComparison', getOrCreateIntFieldComparison);
filterComparisonMap.set('FloatFilterComparison', getOrCreateFloatFieldComparison);
filterComparisonMap.set('BooleanFilterComparison', getOrCreateBooleanFieldComparison);
filterComparisonMap.set('DateFilterComparison', getOrCreateDateFieldComparison);
filterComparisonMap.set('DateTimeFilterComparison', getOrCreateDateFieldComparison);
filterComparisonMap.set('TimestampFilterComparison', getOrCreateTimestampFieldComparison);

const knownTypes: Set<ReturnTypeFuncValue> = new Set([
    String,
    Number,
    Boolean,
    Int,
    Float,
    ID,
    Date,
    GraphQLISODateTime,
    GraphQLTimestamp,
])

type FilterComparisonOptions<T> = {
    fieldType: ClassType<T>;
    fieldName: string;
    allowedComparisons?: FilterComparisonOperators<T>[];
    returnTypeFunc?: ReturnTypeFunc;
}
const upperCaseFirst = (input: string) => input.charAt(0).toUpperCase() + input.slice(1);
const isNamed = (SomeType: any): SomeType is { name: string } => 'name' in SomeType && typeof SomeType.name === 'string';
function getGraphqlEnumMetadata(objType: object): EnumMetadata | undefined {
    // hack to get enums loaded it may break in the future :(
    LazyMetadataStorage.load();
    return TypeMetadataStorage.getEnumsMetadata().find((o) => o.ref === objType);
}
const getTypeName = (SomeType: ReturnTypeFuncValue): string => {
    if (knownTypes.has(SomeType) || isNamed(SomeType)) {
      const typeName = (SomeType as { name: string }).name;
      return upperCaseFirst(typeName);
    }
    if (typeof SomeType === 'object') {
      const enumType = getGraphqlEnumMetadata(SomeType);
      if (enumType) {
            return upperCaseFirst(enumType.name);
      }
    }
    throw new Error(`Unable to create filter comparison for ${JSON.stringify(SomeType)}.`);
}
  
const isCustomFieldComparison = <T>(options: FilterComparisonOptions<T>): boolean => !!options.allowedComparisons;
const getComparisonTypeName = <T>(fieldType: ReturnTypeFuncValue, options: FilterComparisonOptions<T>): string => {
    if (isCustomFieldComparison(options)) {
        return `${upperCaseFirst(options.fieldName)}FilterComparison`;
    }
    return `${getTypeName(fieldType)}FilterComparison`;
}
const isInAllowedList = <T>(arr: T[] | undefined, val: T): boolean => arr?.includes(val) ?? true;

export function createFilterComparisonType<T>(options: FilterComparisonOptions<T>): ClassType<FilterFieldComparison<T>> {
    const fieldType = options.returnTypeFunc ? options.returnTypeFunc() : options.fieldType;
    const inputName = getComparisonTypeName(fieldType, options);
    const generator = filterComparisonMap.get(inputName);

    if (generator) return generator() as ClassType<FilterFieldComparison<T>>;

    const isNotAllowed = (val: FilterComparisonOperators<unknown>) => () =>
      !isInAllowedList(options.allowedComparisons, val as unknown);

    @InputType(inputName)
    class FilterComparisonInputType {
        @SkipIf(isNotAllowed('is'), Field(() => Boolean, { nullable: true }))
        @IsBoolean()
        @IsOptional()
        is?: boolean | null;
    
        @SkipIf(isNotAllowed('isNot'), Field(() => Boolean, { nullable: true }))
        @IsBoolean()
        @IsOptional()
        isNot?: boolean | null;
    
        @SkipIf(isNotAllowed('eq'), Field(() => fieldType, { nullable: true }))
        @IsUndefined()
        @Type(() => options.fieldType)
        eq?: T;
    
        @SkipIf(isNotAllowed('neq'), Field(() => fieldType, { nullable: true }))
        @IsUndefined()
        @Type(() => options.fieldType)
        neq?: T;
    
        @SkipIf(isNotAllowed('gt'), Field(() => fieldType, { nullable: true }))
        @IsUndefined()
        @Type(() => options.fieldType)
        gt?: T;
    
        @SkipIf(isNotAllowed('gte'), Field(() => fieldType, { nullable: true }))
        @IsUndefined()
        @Type(() => options.fieldType)
        gte?: T;
    
        @SkipIf(isNotAllowed('lt'), Field(() => fieldType, { nullable: true }))
        @IsUndefined()
        @Type(() => options.fieldType)
        lt?: T;
    
        @SkipIf(isNotAllowed('lte'), Field(() => fieldType, { nullable: true }))
        @IsUndefined()
        @Type(() => options.fieldType)
        lte?: T;
    
        @SkipIf(isNotAllowed('like'), Field(() => fieldType, { nullable: true }))
        @IsUndefined()
        @Type(() => options.fieldType)
        like?: T;
    
        @SkipIf(isNotAllowed('notLike'), Field(() => fieldType, { nullable: true }))
        @IsUndefined()
        @Type(() => options.fieldType)
        notLike?: T;
    
        @SkipIf(isNotAllowed('iLike'), Field(() => fieldType, { nullable: true }))
        @IsUndefined()
        @Type(() => options.fieldType)
        iLike?: T;
    
        @SkipIf(isNotAllowed('notILike'), Field(() => fieldType, { nullable: true }))
        @IsUndefined()
        @Type(() => options.fieldType)
        notILike?: T;
    
        @SkipIf(isNotAllowed('in'), Field(() => [fieldType], { nullable: true }))
        @IsUndefined()
        @Type(() => options.fieldType)
        in?: T[];
    
        @SkipIf(isNotAllowed('notIn'), Field(() => [fieldType], { nullable: true }))
        @IsUndefined()
        @Type(() => options.fieldType)
        notIn?: T[];
    }
  
    filterComparisonMap.set(inputName, () => FilterComparisonInputType);
    return FilterComparisonInputType as ClassType<FilterFieldComparison<T>>;
}