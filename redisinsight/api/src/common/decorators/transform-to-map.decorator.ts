import { applyDecorators } from '@nestjs/common';
import { Transform, classToPlain, plainToClass } from 'class-transformer';
import { ClassType } from 'class-transformer/ClassTransformer';

export function TransformToMap<T>(targetClass: ClassType<T>) {
  return applyDecorators(
    Transform(
      (value) => {
        if (!value) {
          return value;
        }

        return Object.fromEntries(
          Object.entries(value).map(([key, val]) => [
            key,
            plainToClass(targetClass, val),
          ]),
        );
      },
      { toClassOnly: true },
    ),

    Transform(
      (value) => {
        if (!value) {
          return value;
        }

        return Object.fromEntries(
          Object.entries(value).map(([key, instance]) => [
            key,
            classToPlain(instance),
          ]),
        );
      },
      { toPlainOnly: true },
    ),
  );
}
