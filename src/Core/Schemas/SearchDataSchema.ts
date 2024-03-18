import { z } from "zod";
import MediaTypes from "../Types/Enums/MediaTypes";

const searchDataSchema = z.array(z.object({
    id: z.number(),
    media_type: z.nativeEnum(MediaTypes).or(z.string()),
    original_title: z.string().optional(),
    original_name: z.string().optional(),
    overview: z.string().optional(),
    genre_ids: z.number().array().optional(),
    release_date: z.string().optional(),
    first_air_date: z.string().optional(),
    poster_path: z.string().nullable().optional(),
    backdrop_path: z.string().nullable().optional(),
    vote_average: z.number().optional(),
}));

export default searchDataSchema;
