export default abstract class ObjectMapper {
    public static mapTo<T>(source: object): T {
        let destination: T = {} as T;
        for (const key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                destination[key] = source[key];
            }
        }
        console.log(destination);        
        return destination;
    }

    static AddMapProperty() {
        return (target?: any, propertyKey?: string, descriptor?: PropertyDescriptor) => {
            console.log(target.name, target.prototype, propertyKey, descriptor);
        };
    }
}
