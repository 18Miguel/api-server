import { Type } from "@nestjs/common";
import { ObjectType, Field, Int } from "@nestjs/graphql";
import { ConnectionType } from "../../Interfaces";
import { PageInfo } from "./PageInfo";

export function ConnectionTypeMapper<T>(ClassType: Type<T>) {
    @ObjectType(`${ClassType.name}Edge`, { isAbstract: true })
    abstract class EdgeType {
        @Field(() => String)
        cursor: string;

        @Field(() => ClassType)
        node: T;
    }

    @ObjectType(`${ClassType.name}ConnectionType`)
    class AbstractConnection implements ConnectionType<T> {
        @Field(() => Int)
        totalCount: number = 0;

        @Field(() => PageInfo, { nullable: true })
        pageInfo?: PageInfo;

        @Field(() => [EdgeType], { nullable: true })
        edges?: Array<EdgeType>;
    }
    
    return AbstractConnection;
}