import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';

export function DataAsJsonString() {
  return applyDecorators(
    Transform((object) => JSON.stringify(object), { toClassOnly: true }),
    Transform((string) => {
      try {
        return JSON.parse(string);
      } catch (e) {
        return undefined;
      }
    }, { toPlainOnly: true }),
  );
}
