import { ArgsType } from "@nestjs/graphql";
import MediaDto from "src/Core/DTO/MediaDto";
import { QueryArgsType } from "../Utils/Helpers/QueryArgsType";

@ArgsType()
export class MediaQuery extends QueryArgsType(MediaDto) {};