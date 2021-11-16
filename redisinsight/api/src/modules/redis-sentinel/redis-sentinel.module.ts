import { Module } from '@nestjs/common';
import { SharedModule } from 'src/modules/shared/shared.module';
import { SentinelController } from 'src/modules/redis-sentinel/controllers/sentinel.controller';

@Module({
  imports: [SharedModule],
  providers: [],
  controllers: [SentinelController],
})
export class RedisSentinelModule {}
