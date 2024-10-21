import { ClassTransformOptions, classToPlain, plainToClass } from 'class-transformer';
import { ClassType } from 'class-transformer/ClassTransformer';

export function classToClass<T, V>(
  targetClass: ClassType<T>,
  classInstance: V,
  options?: ClassTransformOptions,
): T {
  const defaultOptions: ClassTransformOptions = {
    excludeExtraneousValues: true,
    groups: ['security'],
  };

  const transformOptions = {
    ...defaultOptions,
    ...options,
  };

  return plainToClass(targetClass, classToPlain(classInstance, transformOptions), transformOptions);
}

export const cloneClassInstance = <V>(entity: V): V => classToClass(entity.constructor as ClassType<V>, entity);
