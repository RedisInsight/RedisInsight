import { KeyResponse } from 'src/modules/browser/keys/dto';
import { ApiProperty } from '@nestjs/swagger';
import { RedisStringType } from 'src/common/decorators';
import { RedisString } from 'src/common/constants';

export class GetListElementsResponse extends KeyResponse {
  @ApiProperty({
    type: Number,
    description: 'The number of elements in the currently-selected list.',
  })
  total: number;

  @ApiProperty({
    type: 'array',
    items: {
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
    description: 'Array of elements.',
  })
  @RedisStringType({ each: true })
  elements: RedisString[];
}
