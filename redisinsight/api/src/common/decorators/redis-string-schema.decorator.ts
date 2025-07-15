import { ApiProperty } from '@nestjs/swagger';

export const REDIS_STRING_SCHEMA = {
  type: String,
  oneOf: [
    { type: 'string' },
    {
      type: 'object',
      properties: {
        type: { type: 'string', example: 'Buffer' },
        data: {
          type: 'array',
          items: { type: 'number' },
          example: [61, 101, 49],
        },
      },
      required: ['type', 'data'],
    },
  ],
};

export const ApiRedisString = (description: string, isArray = false) =>
  ApiProperty({
    description,
    isArray,
    ...REDIS_STRING_SCHEMA,
  });
