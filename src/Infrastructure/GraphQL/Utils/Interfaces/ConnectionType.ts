import { PageInfo } from "../Helpers";
import { IEdgeType } from "./EdgeType";

export interface ConnectionType<T> {
    totalCount: number;
    pageInfo?: PageInfo;
    edges?: Array<IEdgeType<T>>;
}