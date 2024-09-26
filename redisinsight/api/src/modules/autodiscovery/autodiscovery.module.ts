import { Module } from '@nestjs/common';
import { AutodiscoveryService } from 'src/modules/autodiscovery/autodiscovery.service';

@Module({
  providers: [
    AutodiscoveryService,
  ],
  exports: [
    AutodiscoveryService,
  ],
})
export class AutodiscoveryModule {}
