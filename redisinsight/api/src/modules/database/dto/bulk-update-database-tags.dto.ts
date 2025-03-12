import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateTagDto } from 'src/modules/tag/dto/create-tag.dto';

export class BulkUpdateDatabaseTagsDto {
  @ApiProperty({
    description: 'List of tags to be updated',
    type: [CreateTagDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTagDto)
  tags: CreateTagDto[];
}
