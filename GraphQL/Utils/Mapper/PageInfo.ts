import { ObjectType, Field } from "@nestjs/graphql";

@ObjectType()
export default class PageInfo {
    @Field({ nullable: true })
    startCursor: string;

    @Field({ nullable: true })
    endCursor: string;

    @Field()
    hasPreviousPage: boolean;

    @Field()
    hasNextPage: boolean;
}
