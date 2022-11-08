import { Module } from '@nestjs/common';
import { DatabaseImportController } from 'src/modules/database-import/database-import.controller';
import { DatabaseImportService } from 'src/modules/database-import/database-import.service';

@Module({
  controllers: [DatabaseImportController],
  providers: [
    DatabaseImportService,
  ],
})
export class DatabaseImportModule {}
