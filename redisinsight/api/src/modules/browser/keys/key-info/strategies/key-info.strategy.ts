import { Injectable } from '@nestjs/common';
import { GetKeyInfoResponse } from 'src/modules/browser/keys/dto';
import { RedisString } from 'src/common/constants';
import { RedisClient } from 'src/modules/redis/client';
import LoggerService from 'src/modules/logger/logger.service';

@Injectable()
export abstract class KeyInfoStrategy {
  constructor(protected logger: LoggerService) {}

  abstract getInfo(
    client: RedisClient,
    key: RedisString,
    type: string,
  ): Promise<GetKeyInfoResponse>;
}
