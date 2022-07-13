import { Module } from '@nestjs/common';
import { BulkActionsService } from 'src/modules/bulk-actions/bulk-actions.service';
import { BulkActionsProvider } from 'src/modules/bulk-actions/providers/bulk-actions.provider';
import { BulkActionsGateway } from 'src/modules/bulk-actions/bulk-actions.gateway';
import { SharedModule } from 'src/modules/shared/shared.module';

@Module({
  imports: [
    SharedModule,
  ],
  providers: [
    BulkActionsGateway,
    BulkActionsService,
    BulkActionsProvider,
  ],
})
export class BulkActionsModule {}
