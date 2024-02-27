import { Module } from '@nestjs/common';
import { BulkActionsService } from 'src/modules/bulk-actions/bulk-actions.service';
import { BulkActionsProvider } from 'src/modules/bulk-actions/providers/bulk-actions.provider';
import { BulkActionsGateway } from 'src/modules/bulk-actions/bulk-actions.gateway';
import { BulkActionsAnalytics } from 'src/modules/bulk-actions/bulk-actions.analytics';
import { BulkImportController } from 'src/modules/bulk-actions/bulk-import.controller';
import { BulkImportService } from 'src/modules/bulk-actions/bulk-import.service';

@Module({
  controllers: [BulkImportController],
  providers: [
    BulkActionsGateway,
    BulkActionsService,
    BulkActionsProvider,
    BulkActionsAnalytics,
    BulkImportService,
  ],
})
export class BulkActionsModule {}
