import { ObjectType } from "@nestjs/graphql";
import { ObjectTypeMapper } from "../Utils";
import MediaDto from "src/Core/DTO/MediaDto";

@ObjectType()
export default class MediaObjectType extends ObjectTypeMapper(MediaDto) {}
