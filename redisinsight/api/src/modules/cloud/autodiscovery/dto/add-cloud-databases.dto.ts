import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty, IsArray, IsDefined, ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AddCloudDatabaseDto } from 'src/modules/cloud/autodiscovery/dto/add-cloud-database.dto';

export class AddCloudDatabasesDto {
  @ApiProperty({
    description: 'Cloud databases list.',
    type: AddCloudDatabaseDto,
    isArray: true,
  })
  @IsDefined()
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested()
  @Type(() => AddCloudDatabaseDto)
  databases: AddCloudDatabaseDto[];
}
