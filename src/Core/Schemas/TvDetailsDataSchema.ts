import { z } from "zod";
import genresDataSchema from "./GenresDataSchema";

const tvDetailsDataSchema = z.object({
    id: z.number(),
    original_name: z.string().optional(),
    overview: z.string().optional(),
    genres: genresDataSchema,
    first_air_date: z.string().optional(),
    last_air_date: z.string().optional(),
    number_of_episodes: z.number().optional(),
    number_of_seasons: z.number().optional(),
    in_production: z.boolean().optional(),
    poster_path: z.string().nullable().optional(),
    backdrop_path: z.string().nullable().optional(),
    vote_average: z.number(),
});

export default tvDetailsDataSchema;
