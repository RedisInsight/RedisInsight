import { Transform, plainToClass } from 'class-transformer';

export function TransformToMap<T>(cls: new (...args: any[]) => T) {
  return Transform(({ value }) => {
    if (value === undefined || value === null) {
      return value;
    }
    return Object.fromEntries(
      Object.entries(value).map(([key, val]) => [
        key,
        plainToClass(cls, val),
      ]),
    );
  });
}
