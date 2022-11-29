import { Module } from '@nestjs/common';
import { AutodiscoveryService } from 'src/modules/autodiscovery/autodiscovery.service';

@Module({
  providers: [
    AutodiscoveryService,
  ],
})
export class AutodiscoveryModule {}
