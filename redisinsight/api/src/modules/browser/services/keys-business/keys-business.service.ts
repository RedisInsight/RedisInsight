import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { RedisErrorCodes } from 'src/constants';
import { catchAclError } from 'src/utils';
import ERROR_MESSAGES from 'src/constants/error-messages';
import {
  DeleteKeysResponse,
  GetKeyInfoResponse,
  GetKeysDto,
  GetKeysWithDetailsResponse,
  RenameKeyDto,
  RenameKeyResponse,
  UpdateKeyTtlDto,
  KeyTtlResponse,
  RedisDataType,
} from 'src/modules/browser/dto';
import { BrowserToolKeysCommands } from 'src/modules/browser/constants/browser-tool-commands';
import { IFindRedisClientInstanceByOptions } from 'src/modules/core/services/redis/redis.service';
import { InstancesBusinessService } from 'src/modules/shared/services/instances-business/instances-business.service';
import { BrowserToolService } from 'src/modules/browser/services/browser-tool/browser-tool.service';
import {
  BrowserToolClusterService,
} from 'src/modules/browser/services/browser-tool-cluster/browser-tool-cluster.service';
import { ConnectionType } from 'src/modules/core/models/database-instance.entity';
import { Scanner } from 'src/modules/browser/services/keys-business/scanner/scanner';
import { ISettingsProvider } from 'src/modules/core/models/settings-provider.interface';
import { StandaloneStrategy } from './scanner/strategies/standalone.strategy';
import { ClusterStrategy } from './scanner/strategies/cluster.strategy';
import { KeyInfoManager } from './key-info-manager/key-info-manager';
import {
  UnsupportedTypeInfoStrategy,
} from './key-info-manager/strategies/unsupported-type-info/unsupported-type-info.strategy';
import { StringTypeInfoStrategy } from './key-info-manager/strategies/string-type-info/string-type-info.strategy';
import { HashTypeInfoStrategy } from './key-info-manager/strategies/hash-type-info/hash-type-info.strategy';
import { ListTypeInfoStrategy } from './key-info-manager/strategies/list-type-info/list-type-info.strategy';
import { SetTypeInfoStrategy } from './key-info-manager/strategies/set-type-info/set-type-info.strategy';
import { ZSetTypeInfoStrategy } from './key-info-manager/strategies/z-set-type-info/z-set-type-info.strategy';
import { StreamTypeInfoStrategy } from './key-info-manager/strategies/stream-type-info/stream-type-info.strategy';
import {
  RejsonRlTypeInfoStrategy,
} from './key-info-manager/strategies/rejson-rl-type-info/rejson-rl-type-info.strategy';
import { TSTypeInfoStrategy } from './key-info-manager/strategies/ts-type-info/ts-type-info.strategy';
import { GraphTypeInfoStrategy } from './key-info-manager/strategies/graph-type-info/graph-type-info.strategy';

@Injectable()
export class KeysBusinessService {
  private logger = new Logger('KeysBusinessService');

  private scanner;

  private keyInfoManager;

  constructor(
    private instancesBusinessService: InstancesBusinessService,
    private browserTool: BrowserToolService,
    private browserToolCluster: BrowserToolClusterService,
    @Inject('SETTINGS_PROVIDER')
    private settingsService: ISettingsProvider,
  ) {
    this.scanner = new Scanner();
    this.keyInfoManager = new KeyInfoManager(
      new UnsupportedTypeInfoStrategy(browserTool),
    );
    this.scanner.addStrategy(
      ConnectionType.STANDALONE,
      new StandaloneStrategy(browserTool, settingsService),
    );
    this.scanner.addStrategy(
      ConnectionType.CLUSTER,
      new ClusterStrategy(browserToolCluster, settingsService),
    );
    this.scanner.addStrategy(
      ConnectionType.SENTINEL,
      new StandaloneStrategy(browserTool, settingsService),
    );
    this.keyInfoManager.addStrategy(
      RedisDataType.String,
      new StringTypeInfoStrategy(browserTool),
    );
    this.keyInfoManager.addStrategy(
      RedisDataType.Hash,
      new HashTypeInfoStrategy(browserTool),
    );
    this.keyInfoManager.addStrategy(
      RedisDataType.List,
      new ListTypeInfoStrategy(browserTool),
    );
    this.keyInfoManager.addStrategy(
      RedisDataType.Set,
      new SetTypeInfoStrategy(browserTool),
    );
    this.keyInfoManager.addStrategy(
      RedisDataType.ZSet,
      new ZSetTypeInfoStrategy(browserTool),
    );
    this.keyInfoManager.addStrategy(
      RedisDataType.Stream,
      new StreamTypeInfoStrategy(browserTool),
    );
    this.keyInfoManager.addStrategy(
      RedisDataType.JSON,
      new RejsonRlTypeInfoStrategy(browserTool),
    );
    this.keyInfoManager.addStrategy(
      RedisDataType.TS,
      new TSTypeInfoStrategy(browserTool),
    );
    this.keyInfoManager.addStrategy(
      RedisDataType.Graph,
      new GraphTypeInfoStrategy(browserTool),
    );
  }

  public async getKeys(
    clientOptions: IFindRedisClientInstanceByOptions,
    dto: GetKeysDto,
  ): Promise<GetKeysWithDetailsResponse[]> {
    try {
      this.logger.log('Getting keys with details.');
      // todo: refactor. no need entire entity here
      const databaseInstance = await this.instancesBusinessService.getOneById(
        clientOptions.instanceId,
      );
      const scanner = this.scanner.getStrategy(databaseInstance.connectionType);
      const result = await scanner.getKeys(clientOptions, dto);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to get keys with details info. ${error.message}.`,
      );
      if (
        error.message.includes(RedisErrorCodes.CommandSyntaxError)
        && dto.type
      ) {
        throw new BadRequestException(
          ERROR_MESSAGES.SCAN_PER_KEY_TYPE_NOT_SUPPORT(),
        );
      }
      throw catchAclError(error);
    }
  }

  public async getKeyInfo(
    clientOptions: IFindRedisClientInstanceByOptions,
    key: string,
  ): Promise<GetKeyInfoResponse> {
    this.logger.log('Getting key info.');
    try {
      const type = await this.browserTool.execCommand(
        clientOptions,
        BrowserToolKeysCommands.Type,
        [key],
      );
      if (type === 'none') {
        this.logger.error(`Failed to get key info. Not found key: ${key}`);
        return Promise.reject(
          new NotFoundException(ERROR_MESSAGES.KEY_NOT_EXIST),
        );
      }
      const infoManager = this.keyInfoManager.getStrategy(type);
      const result = await infoManager.getInfo(clientOptions, key, type);
      this.logger.log('Succeed to get key info');
      return result;
    } catch (error) {
      this.logger.error('Failed to get key info.', error);
      throw catchAclError(error);
    }
  }

  public async deleteKeys(
    clientOptions: IFindRedisClientInstanceByOptions,
    keys: string[],
  ): Promise<DeleteKeysResponse> {
    this.logger.log('Deleting keys');
    let result;
    try {
      result = await this.browserTool.execCommand(
        clientOptions,
        BrowserToolKeysCommands.Del,
        keys,
      );
    } catch (error) {
      this.logger.error('Failed to delete keys.', error);
      catchAclError(error);
    }
    if (!result) {
      this.logger.error('Failed to delete keys. Not Found keys');
      throw new NotFoundException();
    }
    this.logger.log('Succeed to delete keys');
    return { affected: result };
  }

  public async renameKey(
    clientOptions: IFindRedisClientInstanceByOptions,
    dto: RenameKeyDto,
  ): Promise<RenameKeyResponse> {
    this.logger.log('Renaming key');
    const { keyName, newKeyName } = dto;
    let result;
    try {
      const isExist = await this.browserTool.execCommand(
        clientOptions,
        BrowserToolKeysCommands.Exists,
        [keyName],
      );
      if (!isExist) {
        this.logger.error(
          `Failed to rename key. ${ERROR_MESSAGES.KEY_NOT_EXIST} key: ${keyName}`,
        );
        return Promise.reject(
          new NotFoundException(ERROR_MESSAGES.KEY_NOT_EXIST),
        );
      }
      result = await this.browserTool.execCommand(
        clientOptions,
        BrowserToolKeysCommands.RenameNX,
        [keyName, newKeyName],
      );
    } catch (error) {
      this.logger.error('Failed to rename key.', error);
      catchAclError(error);
    }
    if (!result) {
      this.logger.error(
        `Failed to rename key. ${ERROR_MESSAGES.NEW_KEY_NAME_EXIST} key: ${newKeyName}`,
      );
      throw new BadRequestException(ERROR_MESSAGES.NEW_KEY_NAME_EXIST);
    }
    this.logger.log('Succeed to rename key');
    return { keyName: newKeyName };
  }

  public async updateTtl(
    clientOptions: IFindRedisClientInstanceByOptions,
    dto: UpdateKeyTtlDto,
  ): Promise<KeyTtlResponse> {
    if (dto.ttl === -1) {
      return await this.removeKeyExpiration(clientOptions, dto);
    }
    return await this.setKeyExpiration(clientOptions, dto);
  }

  public async setKeyExpiration(
    clientOptions: IFindRedisClientInstanceByOptions,
    dto: UpdateKeyTtlDto,
  ): Promise<KeyTtlResponse> {
    this.logger.log('Setting a timeout on key.');
    const { keyName, ttl } = dto;
    let currentTtl;
    let result;
    try {
      currentTtl = await this.browserTool.execCommand(
        clientOptions,
        BrowserToolKeysCommands.Ttl,
        [keyName],
      );
      result = await this.browserTool.execCommand(
        clientOptions,
        BrowserToolKeysCommands.Expire,
        [keyName, ttl],
      );
    } catch (error) {
      this.logger.error('Failed to set a timeout on key.', error);
      catchAclError(error);
    }
    if (!result) {
      this.logger.error(
        `Failed to set a timeout on key. ${ERROR_MESSAGES.KEY_NOT_EXIST} key: ${keyName}`,
      );
      throw new NotFoundException(ERROR_MESSAGES.KEY_NOT_EXIST);
    }
    this.logger.log('Succeed to set a timeout on key.');
    return { ttl: ttl >= 0 ? ttl : -2 };
  }

  public async removeKeyExpiration(
    clientOptions: IFindRedisClientInstanceByOptions,
    dto: UpdateKeyTtlDto,
  ): Promise<KeyTtlResponse> {
    this.logger.log('Removing the existing timeout on key.');
    const { keyName } = dto;
    try {
      const currentTtl = await this.browserTool.execCommand(
        clientOptions,
        BrowserToolKeysCommands.Ttl,
        [keyName],
      );
      if (currentTtl === -2) {
        this.logger.error(
          `Failed to remove the existing timeout on key. ${ERROR_MESSAGES.KEY_NOT_EXIST} key: ${keyName}`,
        );
        return Promise.reject(
          new NotFoundException(ERROR_MESSAGES.KEY_NOT_EXIST),
        );
      }
      if (currentTtl > 0) {
        await this.browserTool.execCommand(
          clientOptions,
          BrowserToolKeysCommands.Persist,
          [keyName],
        );
      }
    } catch (error) {
      this.logger.error('Failed to remove the existing timeout on key.', error);
      catchAclError(error);
    }
    this.logger.log('Succeed to remove the existing timeout on key.');
    return { ttl: -1 };
  }
}
