import { ObjectType, Field } from "@nestjs/graphql";

@ObjectType()
export class PageInfo {
    @Field({ nullable: true })
    startCursor: string = null;
    
    @Field()
    hasNextPage: boolean = false;

    @Field({ nullable: true })
    endCursor: string = null;

    @Field()
    hasPreviousPage: boolean = false;
}
