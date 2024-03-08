import { Type } from "@nestjs/common";
import Reflector from "./Reflector";
import { getFilterableFields } from "../Decorators/FilterableField";
import { Field, InputType, TypeMetadataStorage } from "@nestjs/graphql";
import { IsEnum } from "class-validator";
import { IsUndefined } from "../Decorators/IsUndefined";
import { SortDirection, SortNulls } from "../Enums";

const reflector = new Reflector('custom:sort-meta-key');

@InputType('SortInputType', { isAbstract: true })
abstract class SortInputTypeBase {
    @Field(() => SortDirection)
    @IsEnum(SortDirection)
    direction!: SortDirection;

    @Field(() => SortNulls, { nullable: true })
    @IsUndefined()
    @IsEnum(SortNulls)
    nulls?: SortNulls;
}

function getGraphqlObjectName<T>(objType: Type<T>, notFoundMsg: string): string {
    const metadata = TypeMetadataStorage.getObjectTypesMetadata().find((o) => o.target === objType);
    if (!metadata) throw new Error(notFoundMsg);
    return metadata.name;
}

export function SortType<T>(classRef: Type<T>) {
    return reflector.memoize(classRef, () => {
        const prefix = getGraphqlObjectName(classRef, `Unable to make SortType for ${classRef.name}.`);
        const fields = getFilterableFields(classRef);
        if (!fields.length)
            throw new Error(`No fields found to create SortType for ${classRef.name}. Ensure fields are annotated with @FilterableField`);

        const fieldNames = fields.map((f) => f.propertyName);

        @InputType(`${prefix}SortInput`)
        class SortInputType {};

        fieldNames.forEach((fieldName) => {
            Field(() => SortInputTypeBase, { nullable: true })(SortInputType.prototype, fieldName);
        });

        return SortInputType;
    });
}