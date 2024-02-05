import { z } from "zod";
import genresDataSchema from "./GenresDataSchema";

const movieDetailsDataSchema = z.object({
    id: z.number(),
    original_title: z.string().optional(),
    overview: z.string().optional(),
    genres: genresDataSchema,
    release_date: z.string().optional(),
    runtime: z.number().optional(),
    poster_path: z.string().nullable().optional(),
    backdrop_path: z.string().nullable().optional(),
    vote_average: z.number(),
});

export default movieDetailsDataSchema;
