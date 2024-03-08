import { Type } from "@nestjs/common";

export type MetaValue<MetaType> = MetaType | undefined;

export default class Reflector {
    constructor(readonly metaKey: string) {}

    private getClassMetadata<DTO, Data>(
        DTOClass: Type<DTO>,
        key: string,
        includeParents: boolean,
      ): MetaValue<Data> {
        if (includeParents) return Reflect.getMetadata(key, DTOClass) as MetaValue<Data>;
        return Reflect.getOwnMetadata(key, DTOClass) as MetaValue<Data>;
    }
  
    protected getMetadata<Data>(target: Function, includeParents: boolean): MetaValue<Data> {
        if (includeParents) return Reflect.getMetadata(this.metaKey, target) as MetaValue<Data>;
        return Reflect.getOwnMetadata(this.metaKey, target) as MetaValue<Data>;
    }

    protected defineMetadata<Data>(data: Data, target: Function): void {
        Reflect.defineMetadata(this.metaKey, data, target);
    }

    public append<DTO, Data>(DTOClass: Type<DTO>, data: Data): void {
        const metadata = this.getClassMetadata<DTO, Array<Data>>(DTOClass, this.metaKey, false) ?? [];
        metadata.push(data);
        this.defineMetadata(metadata, DTOClass);
    }
    
    public get<DTO, Data>(DTOClass: Type<DTO>, includeParents = false): MetaValue<Array<Data> | Data> {
        return this.getMetadata(DTOClass, includeParents);
    }

    public memoize<DTO, Data>(DTOClass: Type<DTO>, callback: () => Data): Data {
        const existing = this.get<DTO, Data>(DTOClass);
        if (existing) return existing as Data;

        const result = callback();
        this.defineMetadata(result, DTOClass);
        return result;
    }
}