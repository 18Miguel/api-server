import { Type } from "@nestjs/common";
import { InputType, Field } from "@nestjs/graphql";
import { ValidateNested } from "class-validator";
import { Type as PropertyType } from "class-transformer";
import { Filter } from "typeorm";
import { getFilterableFields } from "../../Decorators/FilterableField";
import { createFilterComparisonType } from "./CreateFilterComparisonType";

export function FilterType<T>(classRef: Type<T>) {
    const className = classRef.name;
    const inputTypeName = `${className}FilterInput`;
  
    @InputType(inputTypeName)
    class FilterInputType {
        @Field(() => [FilterInputType], { nullable: true })
        public and?: Array<Filter<T>>;

        @Field(() => [FilterInputType], { nullable: true })
        public or?: Array<Filter<T>>;
    }

    const fields = getFilterableFields(classRef);
    if (!fields.length) throw new Error(`No fields found to create GraphQLFilter for ${classRef.name}`);
    
    fields.forEach(({ propertyName, target, advancedOptions, returnTypeFunc }) => {
        const FilterFieldComparison = createFilterComparisonType({
            fieldType: target,
            fieldName: `${classRef.name}${propertyName.charAt(0).toUpperCase() + propertyName.slice(1)}`,
            allowedComparisons: advancedOptions?.allowedComparisons,
            returnTypeFunc,
        });

        ValidateNested()(FilterInputType.prototype, propertyName);
        Field(() => FilterFieldComparison, {
            nullable: advancedOptions?.filterRequired !== true
        })(FilterInputType.prototype, propertyName);
        PropertyType(() => FilterFieldComparison)(FilterInputType.prototype, propertyName);
    });

    return FilterInputType;
}
