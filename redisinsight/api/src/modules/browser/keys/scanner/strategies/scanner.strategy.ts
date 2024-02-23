import { GetKeyInfoResponse, RedisDataType } from 'src/modules/browser/keys/dto';
import { RedisString } from 'src/common/constants';
import { Injectable } from '@nestjs/common';
import { RedisClient } from 'src/modules/redis/client';
import {
  IScannerStrategy,
  IScannerGetKeysArgs,
  IScannerNodeKeys,
} from 'src/modules/browser/keys/scanner/scanner.interface';
import { SettingsService } from 'src/modules/settings/settings.service';

@Injectable()
export abstract class ScannerStrategy implements IScannerStrategy {
  constructor(
    protected readonly settingsService: SettingsService,
  ) {}

  abstract getKeys(client: RedisClient, args: IScannerGetKeysArgs): Promise<IScannerNodeKeys[]>;

  abstract getKeysInfo(
    client: RedisClient,
    keys: RedisString[],
    filterType?: RedisDataType,
  ): Promise<GetKeyInfoResponse[]>;
}
