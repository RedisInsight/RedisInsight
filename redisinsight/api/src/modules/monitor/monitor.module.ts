import { Module } from '@nestjs/common';
import { SharedModule } from 'src/modules/shared/shared.module';
import { MonitorGateway } from './monitor.gateway';
import { MonitorService } from './monitor.service';

@Module({
  imports: [SharedModule],
  providers: [MonitorGateway, MonitorService],
})
export class MonitorModule {}
