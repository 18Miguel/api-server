import { Type } from "@nestjs/common";
import { ArgsType, Field, Int } from "@nestjs/graphql";
import { ValidateIf, Min, Max } from "class-validator";
import { Query, SortField } from "../Interfaces";
import { Filter } from "../../Utils/Interfaces";
import { FilterType, ConnectionTypeMapper, SortType } from ".";
import { SkipIf } from "../Decorators/SkipIf";

export function QueryArgsType<DTO>(DTOClass: Type<DTO>, options?: { disableFiltering?: boolean, disableSorting?: boolean }) {
    const filterType = FilterType(DTOClass);
    const sortType = SortType(DTOClass);
    const connectionType = ConnectionTypeMapper(DTOClass);

    @ArgsType()
    abstract class QueryArgs implements Query<DTO> {
        public static ConnectionType = connectionType;

        @Field(() => Int, {
            nullable: true,
            description: 'Returns the first _n_ elements from the list.',
        })
        @ValidateIf((_, value) => !!value)
        @Min(1)
        @Max(200)
        public first?: number;

        @Field(() => String, {
            nullable: true,
            description: 'Returns the elements in the list that come after the specified cursor.',
        })
        public after?: string;

        @Field(() => Int, {
            nullable: true,
            description: 'Returns the last _n_ elements from the list.',
        })
        @ValidateIf((_, value) => !!value)
        @Min(1)
        @Max(200)
        public last?: number;

        @Field(() => String, {
            nullable: true,
            description: 'Returns the elements in the list that come before the specified cursor.',
        })
        public before?: string;

        @SkipIf(() => options?.disableFiltering, Field(() => filterType, {
            nullable: true,
            description: 'Specify to filter the records returned.',
        }))
        public where?: Filter<DTO>;

        @SkipIf(() => options?.disableSorting, Field(() => sortType, {
            nullable: true,
            description: 'Specify to sort results.',
        }))
        public order?: SortField<DTO>;
    }

    return QueryArgs;
}