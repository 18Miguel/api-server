import { Type } from "@nestjs/common";
import { Field, FieldOptions, ReturnTypeFunc } from '@nestjs/graphql';
import { FilterComparisonOperators } from "../Interfaces";
import Reflector from "../Helpers/Reflector";

export type FilterableFieldOptions = {
    allowedComparisons?: FilterComparisonOperators<unknown>[];
    filterRequired?: boolean;
    filterOnly?: boolean;
} & FieldOptions;
  
export interface FilterableFieldDescriptor {
    propertyName: string;
    target: Type<unknown>;
    returnTypeFunc?: ReturnTypeFunc;
    advancedOptions?: FilterableFieldOptions;
}

const reflector = new Reflector('custom:filter-meta-key');
  
/**
 * Decorator for Fields that should be filterable through a [[FilterType]]
 */
export function FilterableField(): PropertyDecorator & MethodDecorator;
export function FilterableField(options: FilterableFieldOptions): PropertyDecorator & MethodDecorator;
export function FilterableField(
    returnTypeFunction?: ReturnTypeFunc,
    options?: FilterableFieldOptions,
): PropertyDecorator & MethodDecorator;
export function FilterableField(
    returnTypeFuncOrOptions?: ReturnTypeFunc | FilterableFieldOptions,
    maybeOptions?: FilterableFieldOptions,
): MethodDecorator | PropertyDecorator {
    let returnTypeFunc: ReturnTypeFunc | undefined;
    let advancedOptions: FilterableFieldOptions | undefined;
    if (typeof returnTypeFuncOrOptions === 'function') {
        returnTypeFunc = returnTypeFuncOrOptions;
        advancedOptions = maybeOptions;
    } else if (typeof returnTypeFuncOrOptions === 'object') {
        advancedOptions = returnTypeFuncOrOptions;
    } else if (typeof maybeOptions === 'object') {
        advancedOptions = maybeOptions;
    }
    return <D>(
        target: Object,
        propertyName: string | symbol,
        descriptor: TypedPropertyDescriptor<D>,
    ): TypedPropertyDescriptor<D> | void => {
        const Ctx = Reflect.getMetadata('design:type', target, propertyName) as Type<unknown>;
        reflector.append(target.constructor as Type<unknown>, {
            propertyName: propertyName.toString(),
            target: Ctx,
            returnTypeFunc,
            advancedOptions,
        });
        if (advancedOptions?.filterOnly) {
            return undefined;
        }
        if (returnTypeFunc) {
            return Field(returnTypeFunc, advancedOptions)(target, propertyName, descriptor);
        }
        if (advancedOptions) {
            return Field(advancedOptions)(target, propertyName, descriptor);
        }
        return Field()(target, propertyName, descriptor);
    };
}

function getPrototypeChain(classRef: Type<unknown>): Array<Type<unknown>> {
    const baseClass = Object.getPrototypeOf(classRef) as Type<unknown>;
    if (baseClass) {
      return [classRef, ...getPrototypeChain(baseClass)];
    }
    return [classRef];
}

export function getFilterableFields<DTO>(DTOClass: Type<DTO>): Array<FilterableFieldDescriptor> {
    return getPrototypeChain(DTOClass).reduce((fields, Cls) => {
        const existingFieldNames = fields.map((t) => t.propertyName);
        const typeFields = (reflector.get<unknown, FilterableFieldDescriptor>(Cls) ?? []) as Array<FilterableFieldDescriptor>;
        const newFields = typeFields.filter((t) => !existingFieldNames.includes(t.propertyName));
        return [...newFields, ...fields];
    }, [] as Array<FilterableFieldDescriptor>);
}