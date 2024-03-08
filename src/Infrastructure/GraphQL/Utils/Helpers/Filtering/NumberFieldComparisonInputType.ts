import { Type as ClassType } from "@nestjs/common";
import { Field, InputType } from "@nestjs/graphql";
import { FilterFieldComparison } from "../../Interfaces";
import { IsBoolean, IsNumber, IsOptional, ValidateNested } from "class-validator";
import { IsUndefined } from "../../Decorators/IsUndefined";
import { Type } from "class-transformer";

let numberFieldComparison: ClassType<FilterFieldComparison<number>>;

export function getOrCreateNumberFieldComparison(): ClassType<FilterFieldComparison<number>> {
    if (numberFieldComparison) return numberFieldComparison;

    @InputType()
    class NumberFieldComparisonBetween {
        @Field({ nullable: false })
        @IsNumber()
        lower!: number;

        @Field({ nullable: false })
        @IsNumber()
        upper!: number;
    }

    @InputType()
    class NumberFieldComparison implements FilterFieldComparison<number> {
        @Field(() => Boolean, { nullable: true })
        @IsBoolean()
        @IsOptional()
        is?: boolean | null;

        @Field(() => Boolean, { nullable: true })
        @IsBoolean()
        @IsOptional()
        isNot?: boolean | null;

        @Field({ nullable: true })
        @IsNumber()
        @IsUndefined()
        eq?: number;

        @Field({ nullable: true })
        @IsNumber()
        @IsUndefined()
        neq?: number;

        @Field({ nullable: true })
        @IsNumber()
        @IsUndefined()
        gt?: number;

        @Field({ nullable: true })
        @IsNumber()
        @IsUndefined()
        gte?: number;

        @Field({ nullable: true })
        @IsNumber()
        @IsUndefined()
        lt?: number;

        @Field({ nullable: true })
        @IsNumber()
        @IsUndefined()
        lte?: number;

        @Field(() => [Number], { nullable: true })
        @IsNumber({}, { each: true })
        @IsUndefined()
        in?: number[];

        @Field(() => [Number], { nullable: true })
        @IsNumber({}, { each: true })
        @IsUndefined()
        notIn?: number[];

        @Field(() => NumberFieldComparisonBetween, { nullable: true })
        @ValidateNested()
        @Type(() => NumberFieldComparisonBetween)
        between?: NumberFieldComparisonBetween;

        @Field(() => NumberFieldComparisonBetween, { nullable: true })
        @ValidateNested()
        @Type(() => NumberFieldComparisonBetween)
        notBetween?: NumberFieldComparisonBetween;
    }
    numberFieldComparison = NumberFieldComparison;
    return numberFieldComparison;
}