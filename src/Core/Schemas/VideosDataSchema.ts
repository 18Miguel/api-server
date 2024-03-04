import { z } from "zod";

const VideoDataSchema = z.object({
    id: z.string(),
    name: z.string(),
    type: z.string(),
    site: z.string(),
    key: z.string(),
    official: z.boolean(),
    published_at: z.date().or(z.string()),
});

const VideosDataSchema = z.object({
    id: z.number(),
    results: z.array(VideoDataSchema)
});

export default VideosDataSchema;
export { VideoDataSchema };
