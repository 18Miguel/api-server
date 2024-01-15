export default abstract class ObjectMapper {
    public static mapTo<T>(source: any): T {
        let destination = {} as T;
        for (const key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                destination[key] = source[key];
            }
        }
        return destination;
    }
}
