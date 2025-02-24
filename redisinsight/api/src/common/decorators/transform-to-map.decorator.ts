import { Transform, plainToClass } from 'class-transformer';

export function TransformToMap<T>(cls: new (...args: any[]) => T) {
  return Transform(({ value }) => Object.fromEntries(
    Object.entries(value || {}).map(([key, val]) => [
      key,
      plainToClass(cls, val),
    ]),
  ));
}
