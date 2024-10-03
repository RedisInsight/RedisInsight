import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDefined, IsEnum } from 'class-validator';
import { RedisString } from 'src/common/constants';
import { RedisStringType } from 'src/common/decorators';
import { KeyDto } from 'src/modules/browser/keys/dto';

export enum ListElementDestination {
  Tail = 'TAIL',
  Head = 'HEAD',
}

export class PushElementToListDto extends KeyDto {
  @ApiProperty({
    description: 'List elements',
    isArray: true,
    type: String,
  })
  @IsDefined()
  @RedisStringType({ each: true })
  elements: RedisString[];

  @ApiPropertyOptional({
    description:
      'In order to append elements to the end of the list, '
      + 'use the TAIL value, to prepend use HEAD value. '
      + 'Default: TAIL (when not specified)',
    default: ListElementDestination.Tail,
    enum: ListElementDestination,
  })
  @IsEnum(ListElementDestination, {
    message: `destination must be a valid enum value. Valid values: ${Object.values(
      ListElementDestination,
    )}.`,
  })
  destination: ListElementDestination = ListElementDestination.Tail;
}
