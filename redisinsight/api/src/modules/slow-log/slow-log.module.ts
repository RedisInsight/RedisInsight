import { Module } from '@nestjs/common';
import { SlowLogController } from 'src/modules/slow-log/slow-log.controller';
import { SlowLogService } from 'src/modules/slow-log/slow-log.service';
import { SharedModule } from 'src/modules/shared/shared.module';
import { SlowLogAnalyticsService } from 'src/modules/slow-log/slow-log-analytics.service';

@Module({
  imports: [SharedModule],
  providers: [SlowLogService, SlowLogAnalyticsService],
  controllers: [SlowLogController],
})
export class SlowLogModule {}
