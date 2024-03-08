import { Type as ClassType } from "@nestjs/common";
import { Field, Int, InputType } from "@nestjs/graphql";
import { FilterFieldComparison } from "../../Interfaces";
import { IsBoolean, IsInt, IsOptional, ValidateNested } from "class-validator";
import { Type } from 'class-transformer';
import { IsUndefined } from "../../Decorators/IsUndefined";

let intFieldComparison: ClassType<FilterFieldComparison<number>>;

export function getOrCreateIntFieldComparison(): ClassType<FilterFieldComparison<number>> {
    if (intFieldComparison) return intFieldComparison;

    @InputType()
    class IntFieldComparisonBetween {
        @Field(() => Int, { nullable: false })
        @IsInt()
        lower!: number;

        @Field(() => Int, { nullable: false })
        @IsInt()
        upper!: number;
    }

    @InputType()
    class IntFieldComparison implements FilterFieldComparison<number> {
        @Field(() => Boolean, { nullable: true })
        @IsBoolean()
        @IsOptional()
        is?: boolean | null;

        @Field(() => Boolean, { nullable: true })
        @IsBoolean()
        @IsOptional()
        isNot?: boolean | null;

        @Field(() => Int, { nullable: true })
        @IsInt()
        @IsUndefined()
        eq?: number;

        @Field(() => Int, { nullable: true })
        @IsInt()
        @IsUndefined()
        neq?: number;

        @Field(() => Int, { nullable: true })
        @IsInt()
        @IsUndefined()
        gt?: number;

        @Field(() => Int, { nullable: true })
        @IsInt()
        @IsUndefined()
        gte?: number;

        @Field(() => Int, { nullable: true })
        @IsInt()
        @IsUndefined()
        lt?: number;

        @Field(() => Int, { nullable: true })
        @IsInt()
        @IsUndefined()
        lte?: number;

        @Field(() => [Int], { nullable: true })
        @IsInt({ each: true })
        @IsUndefined()
        in?: number[];

        @Field(() => [Int], { nullable: true })
        @IsInt({ each: true })
        @IsUndefined()
        notIn?: number[];

        @Field(() => IntFieldComparisonBetween, { nullable: true })
        @ValidateNested()
        @Type(() => IntFieldComparisonBetween)
        between?: IntFieldComparisonBetween;

        @Field(() => IntFieldComparisonBetween, { nullable: true })
        @ValidateNested()
        @Type(() => IntFieldComparisonBetween)
        notBetween?: IntFieldComparisonBetween;
    }
    intFieldComparison = IntFieldComparison;
    return intFieldComparison;
}