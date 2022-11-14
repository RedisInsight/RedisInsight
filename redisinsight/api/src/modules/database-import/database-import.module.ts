import { Module } from '@nestjs/common';
import { DatabaseImportController } from 'src/modules/database-import/database-import.controller';
import { DatabaseImportService } from 'src/modules/database-import/database-import.service';
import { DatabaseImportAnalytics } from 'src/modules/database-import/database-import.analytics';

@Module({
  controllers: [DatabaseImportController],
  providers: [
    DatabaseImportService,
    DatabaseImportAnalytics,
  ],
})
export class DatabaseImportModule {}
