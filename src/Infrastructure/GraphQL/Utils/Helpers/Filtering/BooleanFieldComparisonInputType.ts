import { Type as ClassType } from "@nestjs/common";
import { Field, InputType } from "@nestjs/graphql";
import { FilterFieldComparison } from "../../Interfaces";
import { IsBoolean, IsOptional } from "class-validator";

let booleanFieldComparison: ClassType<FilterFieldComparison<boolean>>;

export function getOrCreateBooleanFieldComparison(): ClassType<FilterFieldComparison<boolean>> {
    if (booleanFieldComparison) return booleanFieldComparison;

    @InputType()
    class BooleanFieldComparison implements FilterFieldComparison<boolean> {
        @Field(() => Boolean, { nullable: true })
        @IsBoolean()
        @IsOptional()
        is?: boolean | null;

        @Field(() => Boolean, { nullable: true })
        @IsBoolean()
        @IsOptional()
        isNot?: boolean | null;
    }
    booleanFieldComparison = BooleanFieldComparison;
    return BooleanFieldComparison;
}