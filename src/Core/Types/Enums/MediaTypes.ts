import { registerEnumType } from "@nestjs/graphql";

enum MediaTypes {
    Movie = 'movie',
    TvShow = 'tv',
};
registerEnumType(MediaTypes, { name: 'MediaTypes' });

export default MediaTypes;
