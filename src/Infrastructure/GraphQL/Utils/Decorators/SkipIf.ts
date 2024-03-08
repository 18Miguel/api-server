export function SkipIf(check: () => boolean, ...decorators: Array<ComposableDecorator>): ComposedDecorator {
    if (check()) return (): void => {};
    return composeDecorators(...decorators);
}

type ComposableDecorator = MethodDecorator | PropertyDecorator | ClassDecorator | ParameterDecorator;
type ComposedDecorator = MethodDecorator & PropertyDecorator & ClassDecorator & ParameterDecorator;
function composeDecorators(...decorators: Array<ComposableDecorator>): ComposedDecorator {
    return <TFunction extends Function, Y>(
        target: TFunction | object,
        propertyKey?: string | symbol,
        descriptorOrIndex?: TypedPropertyDescriptor<Y> | number,
    ) => {
        decorators.forEach((decorator) => {
            if (target instanceof Function && !descriptorOrIndex) {
                return (decorator as ClassDecorator)(target);
            }
            if (typeof descriptorOrIndex === 'number') {
                return (decorator as ParameterDecorator)(target, propertyKey as string | symbol, descriptorOrIndex);
            }
            return (decorator as MethodDecorator | PropertyDecorator)(
                target,
                propertyKey as string | symbol,
                descriptorOrIndex as TypedPropertyDescriptor<Y>,
            );
        });
    };
}
