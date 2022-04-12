import { Module } from '@nestjs/common';
import { SharedModule } from 'src/modules/shared/shared.module';
import { ProfilerLogFilesProvider } from 'src/modules/monitor/providers/profiler-log-files.provider';
import { ProfilerController } from 'src/modules/monitor/profiler.controller';
import { MonitorGateway } from './monitor.gateway';
import { MonitorService } from './monitor.service';

@Module({
  imports: [SharedModule],
  providers: [
    MonitorGateway,
    MonitorService,
    ProfilerLogFilesProvider,
  ],
  controllers: [ProfilerController],
})
export class MonitorModule {}
