import { Module } from '@nestjs/common';
import { DatabaseAnalysisController } from 'src/modules/database-analysis/database-analysis.controller';
import { DatabaseAnalysisService } from 'src/modules/database-analysis/database-analysis.service';
import { SharedModule } from 'src/modules/shared/shared.module';
import { DatabaseAnalyzer } from 'src/modules/database-analysis/providers/database-analyzer';
import { DatabaseAnalysisProvider } from 'src/modules/database-analysis/providers/database-analysis.provider';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseAnalysisEntity } from 'src/modules/database-analysis/entities/database-analysis.entity';
import { KeysScanner } from 'src/modules/database-analysis/scanner/keys-scanner';
import { KeyInfoProvider } from 'src/modules/database-analysis/scanner/key-info/key-info.provider';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DatabaseAnalysisEntity,
    ]),
    SharedModule,
  ],
  controllers: [DatabaseAnalysisController],
  providers: [
    DatabaseAnalysisService,
    DatabaseAnalyzer,
    DatabaseAnalysisProvider,
    KeysScanner,
    KeyInfoProvider,
  ],
})
export class DatabaseAnalysisModule {}
