import { Injectable, Logger } from '@nestjs/common';
import { BrowserToolService } from 'src/modules/browser/services/browser-tool/browser-tool.service';
import { ClientMetadata } from 'src/common/models';
import { GetKeyInfoResponse } from 'src/modules/browser/keys/dto';
import { RedisString } from 'src/common/constants';

@Injectable()
export abstract class TypeInfoStrategy {
  protected readonly logger = new Logger(this.constructor.name);

  constructor(protected readonly redisManager: BrowserToolService) {}

  abstract getInfo(
    clientMetadata: ClientMetadata,
    key: RedisString,
    type: string,
  ): Promise<GetKeyInfoResponse>;
}
