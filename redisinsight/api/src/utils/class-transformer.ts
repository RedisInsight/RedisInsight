import { ClassType } from 'class-transformer/ClassTransformer';
import { ClassTransformOptions } from 'class-transformer/ClassTransformOptions';
import { classToPlain, plainToClass } from 'class-transformer';

export function classToClass<T, V>(
  targetClass: ClassType<T>,
  classInstance: V,
  options?: ClassTransformOptions,
): T {
  const defaultOptions = {
    excludeExtraneousValues: true,
  };

  return plainToClass(targetClass, classToPlain(classInstance), {
    ...defaultOptions,
    ...options,
  });
}
