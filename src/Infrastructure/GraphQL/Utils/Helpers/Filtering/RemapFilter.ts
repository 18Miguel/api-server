import { Filter } from "../../Interfaces";

export function remapFilter<T, S extends Record<string, any>>(
    where: Filter<S>,
    remapProperty: (key: keyof S, value: any) => Record<string, any> | undefined
): Filter<T> {
    if (!where) return {};
    const remappedFilter: Filter<T> = {};
    for (const key in where) {
        if (key === 'and' || key === 'or') {
            remappedFilter[key] = where[key]?.map(
                (filter) => remapFilter(filter, remapProperty)
            );
        } else {
            const mappedKey = remapProperty(key as keyof S, where[key]);
            if (mappedKey) {
                remappedFilter[Object.keys(mappedKey).at(0)] = mappedKey[Object.keys(mappedKey).at(0)];
                delete where[key];
            }
        }
    }
    return Object.assign(where, remappedFilter);
}
