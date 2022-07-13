import { BulkActionFilter } from 'src/modules/bulk-actions/models/bulk-action-filter';
import { BulkActionType } from 'src/modules/bulk-actions/contants';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { BulkActionIdDto } from 'src/modules/bulk-actions/dto/bulk-action-id.dto';

export class CreateBulkActionDto extends BulkActionIdDto {
  @IsNotEmpty()
  @IsString()
  databaseId: string;

  @IsNotEmpty()
  @IsEnum(BulkActionType)
  type: BulkActionType;

  @IsNotEmpty()
  @Type(() => BulkActionFilter)
  filter: BulkActionFilter;
}
