import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class StringOperationFilterInput {
    @Field(() => [StringOperationFilterInput], { nullable: true })
    and: Array<StringOperationFilterInput>;

    @Field(() => [StringOperationFilterInput], { nullable: true })
    or: Array<StringOperationFilterInput>;

    @Field(() => String, { nullable: true })
    eq: String;

    @Field(() => String, { nullable: true })
    neq: String;

    @Field(() => String, { nullable: true })
    contains: String;

    @Field(() => String, { nullable: true })
    ncontains: String;

    @Field(() => [String], { nullable: true })
    in: Array<String> | null;

    @Field(() => [String], { nullable: true })
    nin: Array<String> | null;

    @Field(() => String, { nullable: true })
    startsWith: String;

    @Field(() => String, { nullable: true })
    nstartsWith: String;

    @Field(() => String, { nullable: true })
    endsWith: String;

    @Field(() => String, { nullable: true })
    nendsWith: String;
}

@InputType()
export class ComparableNumberOperationFilterInput  {
    @Field(() => Int, { nullable: true })
    eq: Number;

    @Field(() => Int, { nullable: true })
    neq: Number;

    @Field(() => [Int], { nullable: true })
    in: Array<Number>;

    @Field(() => [Int], { nullable: true })
    nin: Array<Number>;

    @Field(() => Int, { nullable: true })
    gt: Number;

    @Field(() => Int, { nullable: true })
    ngt: Number;

    @Field(() => Int, { nullable: true })
    gte: Number;

    @Field(() => Int, { nullable: true })
    ngte: Number;

    @Field(() => Int, { nullable: true })
    lt: Number;

    @Field(() => Int, { nullable: true })
    nlt: Number;

    @Field(() => Int, { nullable: true })
    lte: Number;

    @Field(() => Int, { nullable: true })
    nlte: Number;
}

export function EnumOperationFilterInput<T>(EnumType: any){
    @InputType({ isAbstract: true })
    abstract class EnumOperationFilterInput {
        @Field(() => EnumType, { nullable: true })
        eq: T;

        @Field(() => EnumType, { nullable: true })
        neq: T;

        @Field(() => [EnumType], { nullable: true })
        in: Array<T> | null;

        @Field(() => [EnumType], { nullable: true })
        nin: Array<T> | null;
    }

    return EnumOperationFilterInput;
}

@InputType()
export class ComparableDateOperationFilterInput {
    @Field(() => Date, { nullable: true })
    eq: Date;

    @Field(() => Date, { nullable: true })
    neq: Date;

    @Field(() => [Date], { nullable: true })
    in: Array<Date>;

    @Field(() => [Date], { nullable: true })
    nin: Array<Date>;

    @Field(() => Date, { nullable: true })
    gt: Date;

    @Field(() => Date, { nullable: true })
    ngt: Date;

    @Field(() => Date, { nullable: true })
    gte: Date;

    @Field(() => Date, { nullable: true })
    ngte: Date;

    @Field(() => Date, { nullable: true })
    lt: Date;

    @Field(() => Date, { nullable: true })
    nlt: Date;

    @Field(() => Date)
    lte: Date;

    @Field(() => Date)
    nlte: Date;
}