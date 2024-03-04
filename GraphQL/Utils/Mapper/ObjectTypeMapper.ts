import { Type } from "@nestjs/common";
import { ObjectType, Field, Int } from "@nestjs/graphql";
import PageInfo from "./PageInfo";

export interface IEdgeType<T> {
    cursor: string;
    node: T;
}

export interface IObjectType<T> {
    totalCount: number;
    pageInfo: PageInfo;
    edges: Array<IEdgeType<T>>;
}

export function ObjectTypeMapper<T>(ClassType: Type<T>) {
    @ObjectType(`${ClassType.name}Edge`, { isAbstract: true })
    abstract class EdgeType {
        @Field(() => String)
        cursor: string;

        @Field(() => ClassType)
        node: T;
    }

    @ObjectType({ isAbstract: true })
    abstract class PaginatedType implements IObjectType<T> {
        @Field(() => Int)
        totalCount: number = 0;

        @Field(() => PageInfo, { nullable: true })
        pageInfo: PageInfo | null;

        @Field(() => [EdgeType], { nullable: true })
        edges: Array<EdgeType> | null;
    }
    
    return PaginatedType;
}
