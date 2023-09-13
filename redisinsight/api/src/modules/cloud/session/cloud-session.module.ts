import { Module } from '@nestjs/common';
import { CloudSessionService } from 'src/modules/cloud/session/cloud-session.service';

@Module({
  providers: [CloudSessionService],
  exports: [CloudSessionService],
})
export class CloudSessionModule {}
