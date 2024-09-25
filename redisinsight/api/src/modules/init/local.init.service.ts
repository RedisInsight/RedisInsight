import { InitService } from 'src/modules/init/init.service';
import { ServerService } from 'src/modules/server/server.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LocalInitService extends InitService {
  constructor(
    private readonly serverService: ServerService,
  ) {
    super();
  }

  /**
   * Initialize everything is needed in proper order
   */
  async onModuleInit(): Promise<void> {
    await this.serverService.init();
    // features config init
    // features config sync (async?)
    // feature flags recalculate
    // Redis Client factory
    // autodiscovery?
    // analytics
  }
}
