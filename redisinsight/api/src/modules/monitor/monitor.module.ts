import { Module } from '@nestjs/common';
import { SharedModule } from 'src/modules/shared/shared.module';
import { MonitorGateway } from './gateways/monitor.gateway';
import { MonitorService } from './services/monitor-provider/monitor.service';

@Module({
  imports: [SharedModule],
  providers: [MonitorGateway, MonitorService],
})
export class MonitorModule {}
