import { Module } from '@nestjs/common';
import { DatabaseAnalysisController } from 'src/modules/database-analysis/database-analysis.controller';
import { DatabaseAnalysisService } from 'src/modules/database-analysis/database-analysis.service';
import { SharedModule } from 'src/modules/shared/shared.module';

@Module({
  imports: [SharedModule],
  controllers: [DatabaseAnalysisController],
  providers: [DatabaseAnalysisService],
})
export class DatabaseAnalysisModule {}
