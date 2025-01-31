import { ClassTransformOptions, classToPlain, plainToClass } from 'class-transformer';

export function classToClass<T, V>(
  targetClass: new () => T,
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

export const cloneClassInstance = <V>(entity: V): V => classToClass(entity.constructor as new () => V, entity);
