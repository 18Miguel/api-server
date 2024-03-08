import { Field, InputType } from "@nestjs/graphql";
import { ComparableDateOperationFilterInput, ComparableNumberOperationFilterInput, EnumOperationFilterInput, StringOperationFilterInput } from "../Utils";
import MediaTypes from "src/Core/Types/Enums/MediaTypes";

@InputType()
class MediaTypeEnumOperationFilterInput extends EnumOperationFilterInput<MediaTypes>(MediaTypes) {}

@InputType()
export default class MediaFilterInput {
    @Field(() => [MediaFilterInput], { nullable: true })
    public and: Array<MediaFilterInput> | null;

    @Field(() => [MediaFilterInput], { nullable: true })
    public or: Array<MediaFilterInput> | null;

    @Field(() => ComparableNumberOperationFilterInput, { nullable: true })
    public id: ComparableNumberOperationFilterInput;

    @Field(() => ComparableNumberOperationFilterInput, { nullable: true })
    public tmdbId: ComparableNumberOperationFilterInput;

    @Field(() => MediaTypeEnumOperationFilterInput, { nullable: true })
    public type: MediaTypeEnumOperationFilterInput;

    @Field(() => StringOperationFilterInput, { nullable: true })
    public title: StringOperationFilterInput;

    @Field(() => ComparableDateOperationFilterInput, { nullable: true })
    public releaseDate: ComparableDateOperationFilterInput;

    @Field(() => StringOperationFilterInput, { nullable: true })
    public genres: StringOperationFilterInput;

    @Field(() => StringOperationFilterInput, { nullable: true })
    public posterPath: StringOperationFilterInput;

    @Field(() => ComparableNumberOperationFilterInput, { nullable: true })
    public numberOfEpisodes: ComparableNumberOperationFilterInput;
    
    @Field(() => Boolean, { nullable: true })
    public inProduction: boolean;

    @Field(() => Boolean, { nullable: true })
    public watched: boolean;
}