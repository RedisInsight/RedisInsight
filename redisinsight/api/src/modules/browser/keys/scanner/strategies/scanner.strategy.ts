import { BrowserToolKeysCommands } from 'src/modules/browser/constants/browser-tool-commands';
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

  public async getKeyInfo(client: RedisClient, key: RedisString, knownType?: RedisDataType) {
    const options = {
      replyEncoding: 'utf8' as BufferEncoding,
    };

    // @ts-ignore
    const size = await client.sendCommand(new IORedis.Command(
      'memory',
      ['usage', key, 'samples', '0'],
      options,
    ));

    const type = knownType
      // @ts-ignore
      || await client.sendCommand(new IORedis.Command(
        BrowserToolKeysCommands.Type,
        [key],
        options,
      ));

    // @ts-ignore
    const ttl = await client.sendCommand(new IORedis.Command(
      BrowserToolKeysCommands.Ttl,
      [key],
      options,
    ));

    return {
      name: key,
      type,
      ttl,
      size,
    };
  }

  abstract getKeysInfo(
    client: RedisClient,
    keys: RedisString[],
    filterType?: RedisDataType,
  ): Promise<GetKeyInfoResponse[]>;
}
