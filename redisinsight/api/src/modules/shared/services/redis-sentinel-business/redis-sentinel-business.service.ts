import {
  BadRequestException,
  HttpException,
  Injectable,
  Logger,
} from '@nestjs/common';
import IORedis from 'ioredis';
import {
  catchAclError,
  convertStringsArrayToObject,
  getRedisConnectionException,
} from 'src/utils';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { SentinelMaster, SentinelMasterStatus } from 'src/modules/redis-sentinel/models/sentinel';
import { RedisService } from 'src/modules/core/services/redis/redis.service';
import { EndpointDto } from 'src/modules/instances/dto/database-instance.dto';
import { GetSentinelMastersDto } from 'src/modules/redis-sentinel/dto/sentinel.dto';
import { AppTool } from 'src/models';
import { AutodiscoveryAnalyticsService } from '../autodiscovery-analytics.service/autodiscovery-analytics.service';

@Injectable()
export class RedisSentinelBusinessService {
  private logger = new Logger('RedisSentinelBusinessService');

  constructor(
    private redisService: RedisService,
    private autodiscoveryAnalyticsService: AutodiscoveryAnalyticsService,
  ) {}

  public async connectAndGetMasters(
    dto: GetSentinelMastersDto,
  ): Promise<SentinelMaster[]> {
    this.logger.log('Connection and getting sentinel masters.');
    let result: SentinelMaster[];
    try {
      const client = await this.redisService.createStandaloneClient(dto, AppTool.Common, false);
      result = await this.getMasters(client);
      this.autodiscoveryAnalyticsService.sendGetSentinelMastersSucceedEvent(result);

      if (client?.quit) {
        try {
          await client.quit();
        } catch (e) {
          this.logger.error('Unable to quit connection', e);
        }
      } else if (client?.disconnect) {
        await client.disconnect();
      }
    } catch (error) {
      const exception: HttpException = getRedisConnectionException(error, dto);
      this.autodiscoveryAnalyticsService.sendGetSentinelMastersFailedEvent(exception);
      throw exception;
    }
    return result;
  }

  public async getMasters(client: IORedis.Redis): Promise<SentinelMaster[]> {
    this.logger.log('Getting sentinel masters.');
    let result: SentinelMaster[];
    try {
      const reply = await client.send_command('sentinel', ['masters']);
      result = reply.map((item) => {
        const {
          ip,
          port,
          name,
          'num-slaves': numberOfSlaves,
          flags,
        } = convertStringsArrayToObject(item);
        return {
          host: ip,
          port: parseInt(port, 10),
          name,
          status: flags?.includes('down') ? SentinelMasterStatus.Down : SentinelMasterStatus.Active,
          numberOfSlaves: parseInt(numberOfSlaves, 10),
        };
      });
      await Promise.all(
        result.map(async (master: SentinelMaster, index: number) => {
          const endpoints = await this.getMasterEndpoints(client, master.name);
          result[index] = {
            ...master,
            endpoints,
          };
        }),
      );
    } catch (error) {
      this.logger.error('Failed to get sentinel masters.', error);
      if (error.message.includes('unknown command `sentinel`')) {
        throw new BadRequestException(ERROR_MESSAGES.WRONG_DISCOVERY_TOOL());
      }
      catchAclError(error);
    }
    this.logger.log('Succeed to get sentinel masters.');
    return result;
  }

  public async getMasterEndpoints(
    client: IORedis.Redis,
    masterName: string,
  ): Promise<EndpointDto[]> {
    this.logger.log('Getting a list of sentinel instances for master.');
    let result: EndpointDto[];
    try {
      const reply = await client.send_command('sentinel', [
        'sentinels',
        masterName,
      ]);
      result = reply.map((item) => {
        const { ip, port } = convertStringsArrayToObject(item);
        return { host: ip, port: parseInt(port, 10) };
      });
      result = [
        { host: client.options.host, port: client.options.port },
        ...result,
      ];
    } catch (error) {
      this.logger.error('Failed to get a list of sentinel instances for master.', error);
      if (error.message.includes('unknown command `sentinel`')) {
        throw new BadRequestException(ERROR_MESSAGES.WRONG_DATABASE_TYPE);
      }
      catchAclError(error);
    }
    this.logger.log('Succeed to get a list of sentinel instances for master.');
    return result;
  }
}
