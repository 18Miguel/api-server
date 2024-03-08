import { registerEnumType } from "@nestjs/graphql";

enum SortEnumType {
    ASC,
    DESC
};
registerEnumType(SortEnumType, { name: 'SortEnumType' });

export default SortEnumType;
