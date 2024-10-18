import { forEach } from 'lodash';
import { applyDecorators } from '@nestjs/common';
import { classToPlain, plainToClass, Transform } from 'class-transformer';
import { ClassType } from 'class-transformer/ClassTransformer';

export function ObjectAsMap<T>(targetClass: ClassType<T>) {
  return applyDecorators(
    Transform(
      (object): Map<string, T> => {
        const result = new Map();

        try {
          forEach(object, (value, key) => {
            result.set(key, plainToClass(targetClass, value));
          });

          return result;
        } catch (e) {
          return result;
        }
      },
      { toClassOnly: true },
    ),
    Transform(
      (map): object => {
        try {
          const result = {};

          forEach(Array.from(map), ([key, value]) => {
            result[key] = classToPlain(value);
          });

          return result;
        } catch (e) {
          return undefined;
        }
      },
      { toPlainOnly: true },
    ),
  );
}
