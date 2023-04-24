import { Module } from '@nestjs/common';
import { BulkActionsService } from 'src/modules/bulk-actions/bulk-actions.service';
import { BulkActionsProvider } from 'src/modules/bulk-actions/providers/bulk-actions.provider';
import { BulkActionsGateway } from 'src/modules/bulk-actions/bulk-actions.gateway';
import { BulkActionsAnalyticsService } from 'src/modules/bulk-actions/bulk-actions-analytics.service';
import { BulkImportController } from 'src/modules/bulk-actions/bulk-import.controller';
import { BulkImportService } from 'src/modules/bulk-actions/bulk-import.service';

@Module({
  controllers: [BulkImportController],
  providers: [
    BulkActionsGateway,
    BulkActionsService,
    BulkActionsProvider,
    BulkActionsAnalyticsService,
    BulkImportService,
  ],
})
export class BulkActionsModule {}
