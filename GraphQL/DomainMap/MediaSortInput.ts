import { InputType, Field } from "@nestjs/graphql";
import { SortEnumType } from "../Utils";

@InputType()
export default class MediaSortInput {
    @Field(() => SortEnumType, { nullable: true })
    public id: SortEnumType;

    @Field(() => SortEnumType, { nullable: true })
    public tmdbId: SortEnumType;

    @Field(() => SortEnumType, { nullable: true })
    public type: SortEnumType;

    @Field(() => SortEnumType, { nullable: true })
    public title: SortEnumType;

    @Field(() => SortEnumType, { nullable: true })
    public releaseDate: SortEnumType;

    @Field(() => SortEnumType, { nullable: true })
    public genres: SortEnumType;

    @Field(() => SortEnumType, { nullable: true })
    public posterPath: SortEnumType;

    @Field(() => SortEnumType, { nullable: true })
    public numberOfEpisodes: SortEnumType;
    
    @Field(() => SortEnumType, { nullable: true })
    public inProduction: SortEnumType;

    @Field(() => SortEnumType, { nullable: true })
    public watched: SortEnumType;
}