import {
  registerDecorator,
  ValidationOptions,
} from 'class-validator';
import { CloudJobDataValidator } from 'src/common/validators';

export function CloudJobDataDecorator(validationOptions?: ValidationOptions) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      name: 'CloudJobDataDecorator',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: CloudJobDataValidator,
    });
  };
}
