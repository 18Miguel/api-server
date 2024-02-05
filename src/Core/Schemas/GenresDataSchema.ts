import { z } from "zod";

const genresDataSchema = z.array(z.object({
    id: z.number(),
    name: z.string()
})).optional();

export default genresDataSchema;
