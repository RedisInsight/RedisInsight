import { HttpException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TelemetryEvents } from 'src/constants';
import { getRangeForNumber, TOTAL_KEYS_BREAKPOINTS } from 'src/utils';
import { DatabaseInstanceResponse } from 'src/modules/instances/dto/database-instance.dto';
import { RedisDatabaseInfoResponse } from 'src/modules/instances/dto/redis-info.dto';
import { TelemetryBaseService } from 'src/modules/shared/services/base/telemetry.base.service';
import { getRedisModulesSummary } from 'src/utils/redis-modules-summary';
import { Database } from 'src/modules/database/models/database';

@Injectable()
export class InstancesAnalyticsService extends TelemetryBaseService {
  constructor(protected eventEmitter: EventEmitter2) {
    super(eventEmitter);
  }

  sendInstanceAddedEvent(
    instance: DatabaseInstanceResponse,
    additionalInfo: RedisDatabaseInfoResponse,
  ): void {
    try {
      const modulesSummary = getRedisModulesSummary(instance.modules);
      this.sendEvent(
        TelemetryEvents.RedisInstanceAdded,
        {
          databaseId: instance.id,
          connectionType: instance.connectionType,
          provider: instance.provider,
          useTLS: instance.tls ? 'enabled' : 'disabled',
          verifyTLSCertificate: instance?.tls?.verifyServerCert
            ? 'enabled'
            : 'disabled',
          useTLSAuthClients: instance?.tls?.clientCertPairId
            ? 'enabled'
            : 'disabled',
          useSNI: instance?.tls?.servername
            ? 'enabled'
            : 'disabled',
          version: additionalInfo.version,
          numberOfKeys: additionalInfo.totalKeys,
          numberOfKeysRange: getRangeForNumber(additionalInfo.totalKeys, TOTAL_KEYS_BREAKPOINTS),
          totalMemory: additionalInfo.usedMemory,
          numberedDatabases: additionalInfo.databases,
          numberOfModules: instance.modules.length,
          ...modulesSummary,
        },
      );
    } catch (e) {
      // continue regardless of error
    }
  }

  sendInstanceAddFailedEvent(exception: HttpException): void {
    this.sendFailedEvent(TelemetryEvents.RedisInstanceAddFailed, exception);
  }
}
