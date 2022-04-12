import { Module } from '@nestjs/common';
import { SharedModule } from 'src/modules/shared/shared.module';
import { LogFileProvider } from 'src/modules/profiler/providers/log-file.provider';
import { ProfilerController } from 'src/modules/profiler/profiler.controller';
import { ProfilerGateway } from './profiler.gateway';
import { ProfilerService } from './profiler.service';

@Module({
  imports: [SharedModule],
  providers: [
    ProfilerGateway,
    ProfilerService,
    LogFileProvider,
  ],
  controllers: [ProfilerController],
})
export class ProfilerModule {}
