import { z } from "zod";

export const envTMDBSchema = z.object({
    TMDB_API_KEY: z.string(),
    TMDB_API_TOKEN: z.string(),
});
