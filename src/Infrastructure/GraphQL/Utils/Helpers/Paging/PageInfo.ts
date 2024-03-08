import { ObjectType, Field } from "@nestjs/graphql";

@ObjectType()
export class PageInfo {
    @Field({ nullable: true })
    startCursor: string;
    
    @Field()
    hasNextPage: boolean;

    @Field({ nullable: true })
    endCursor: string;

    @Field()
    hasPreviousPage: boolean;
}
