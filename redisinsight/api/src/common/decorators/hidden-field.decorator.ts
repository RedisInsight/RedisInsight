import { Transform } from 'class-transformer';

export function HiddenField(field: any): PropertyDecorator {
  return Transform((value: string) => (value ? field : undefined), {
    toPlainOnly: true,
  });
}
