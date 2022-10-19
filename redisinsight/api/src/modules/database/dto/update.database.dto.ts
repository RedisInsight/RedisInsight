import { CreateDatabaseDto } from 'src/modules/database/dto/create.database.dto';
import { PartialType } from '@nestjs/swagger';

export class UpdateDatabaseDto extends PartialType(CreateDatabaseDto) {}
