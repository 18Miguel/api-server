export default class ValidatorRule {
    private conditions: boolean[] = [];

    private constructor(conditions: boolean[]) {
        this.conditions = conditions;
    }

    static when(condition: boolean): ValidatorRule {
        return new ValidatorRule([condition]);
    }

    when(condition: boolean): ValidatorRule {
        this.conditions.push(condition);
        return this;
    }

    triggerException(exception: Error): void {
        if (this.conditions.some((condition) => condition)) {
            throw exception;
        }
    }
}
