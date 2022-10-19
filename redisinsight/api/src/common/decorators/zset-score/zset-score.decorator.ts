import {
  registerDecorator,
  ValidationOptions,
} from 'class-validator';
import { ZSetScoreValidator } from 'src/common/validators';

export function IsNumberOrString(validationOptions?: ValidationOptions) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      name: 'IsNumberOrString',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: ZSetScoreValidator,
    });
  };
}
