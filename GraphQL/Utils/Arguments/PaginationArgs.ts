import { ArgsType, Int, Field } from '@nestjs/graphql';
import { Max, Min, ValidateIf } from 'class-validator';

@ArgsType()
export default class PaginationArgs {
    @Field(() => Int, { nullable: true, description: 'Returns the first _n_ elements from the list.' })
    @ValidateIf((_, value) => !!value)
    @Min(1)
    @Max(100)
    first: number | null;

    @Field(() => String, { nullable: true, description: 'Returns the elements in the list that come after the specified cursor.' })
    after: string | null;

    @Field(() => Int, { nullable: true, description: 'Returns the last _n_ elements from the list.' })
    @ValidateIf((_, value) => !!value)
    @Min(1)
    @Max(100)
    last: number | null;

    @Field(() => String, { nullable: true, description: 'Returns the elements in the list that come before the specified cursor.' })
    before: string | null;
};
