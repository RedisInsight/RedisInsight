import { KeyDto } from 'src/modules/browser/keys/dto';
import { ArrayNotEmpty, IsArray, IsDefined } from 'class-validator';
import {
  ApiRedisString,
  IsRedisString,
  RedisStringType,
} from 'src/common/decorators';
import { RedisString } from 'src/common/constants';

export class DeleteFieldsFromHashDto extends KeyDto {
  @ApiRedisString('Hash fields', true)
  @IsDefined()
  @IsArray()
  @ArrayNotEmpty()
  @IsRedisString({ each: true })
  @RedisStringType({ each: true })
  fields: RedisString[];
}
