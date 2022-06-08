import { HttpException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TelemetryEvents } from 'src/constants';
import { getRangeForNumber, TOTAL_KEYS_BREAKPOINTS } from 'src/utils';
import { DatabaseInstanceResponse } from 'src/modules/instances/dto/database-instance.dto';
import { RedisDatabaseInfoResponse } from 'src/modules/instances/dto/redis-info.dto';
import { TelemetryBaseService } from 'src/modules/shared/services/base/telemetry.base.service';
import { getRedisModulesSummary } from 'src/utils/redis-modules-summary';

@Injectable()
export class InstancesAnalyticsService extends TelemetryBaseService {
  constructor(protected eventEmitter: EventEmitter2) {
    super(eventEmitter);
  }

  sendInstanceListReceivedEvent(
    instances: DatabaseInstanceResponse[],
    additionalData: object = {},
  ): void {
    try {
      this.sendEvent(
        TelemetryEvents.RedisInstanceListReceived,
        {
          numberOfDatabases: instances.length,
          ...additionalData,
        },
      );
    } catch (e) {
      // continue regardless of error
    }
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

  sendInstanceEditedEvent(
    prev: DatabaseInstanceResponse,
    cur: DatabaseInstanceResponse,
    manualUpdate: boolean = true,
  ): void {
    try {
      if (manualUpdate) {
        this.sendEvent(
          TelemetryEvents.RedisInstanceEditedByUser,
          {
            databaseId: cur.id,
            connectionType: cur.connectionType,
            provider: cur.provider,
            useTLS: cur.tls ? 'enabled' : 'disabled',
            verifyTLSCertificate: cur?.tls?.verifyServerCert
              ? 'enabled'
              : 'disabled',
            useTLSAuthClients: cur?.tls?.clientCertPairId ? 'enabled' : 'disabled',
            previousValues: {
              connectionType: prev.connectionType,
              provider: prev.provider,
              useTLS: prev.tls ? 'enabled' : 'disabled',
              verifyTLSCertificate: prev?.tls?.verifyServerCert
                ? 'enabled'
                : 'disabled',
              useTLSAuthClients: prev?.tls?.clientCertPairId
                ? 'enabled'
                : 'disabled',
            },
          },
        );
      }
    } catch (e) {
      // continue regardless of error
    }
  }

  sendInstanceDeletedEvent(instance: DatabaseInstanceResponse): void {
    this.sendEvent(
      TelemetryEvents.RedisInstanceDeleted,
      {
        databaseId: instance.id,
        provider: instance.provider,
      },
    );
  }

  sendConnectionFailedEvent(instance: DatabaseInstanceResponse, exception: HttpException): void {
    this.sendFailedEvent(
      TelemetryEvents.RedisInstanceConnectionFailed,
      exception,
      { databaseId: instance.id },
    );
  }
}
