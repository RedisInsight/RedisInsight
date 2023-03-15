import { CreateDatabaseDto } from 'src/modules/database/dto/create.database.dto';
import { PartialType } from '@nestjs/swagger';
import {
  IsInt, IsString, MaxLength, ValidateIf,
} from 'class-validator';

export class ModifyDatabaseDto extends PartialType(CreateDatabaseDto) {
  @ValidateIf((object, value) => value !== undefined)
  @IsString({ always: true })
  @MaxLength(500)
  name: string;

  @ValidateIf((object, value) => value !== undefined)
  @IsString({ always: true })
  host: string;

  @ValidateIf((object, value) => value !== undefined)
  @IsInt({ always: true })
  port: number;
}
