import { Sort } from "../Interfaces";

export function remapSort<T, S extends Record<string, any>>(
    order: Sort<S>,
    remapProperty: (key: keyof S, value: any) => Record<string, any> | undefined
): Sort<T> {
    if (!order) return {};
    const remappedSort: Sort<T> = {};
    for (const key in order) {
        const mappedKey = remapProperty(key as keyof S, order[key]);
        if (mappedKey) {
            remappedSort[Object.keys(mappedKey).at(0)] = mappedKey[Object.keys(mappedKey).at(0)];
            delete order[key];
        }
    }
    return Object.assign(order, remappedSort);
}