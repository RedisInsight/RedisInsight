import { HttpException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TelemetryBaseService } from 'src/modules/analytics/telemetry.base.service';
import { Database } from 'src/modules/database/models/database';
import { TelemetryEvents } from 'src/constants';
import { getRedisModulesSummary } from 'src/utils/redis-modules-summary';
import { getRangeForNumber, TOTAL_KEYS_BREAKPOINTS } from 'src/utils';
import { RedisDatabaseInfoResponse } from 'src/modules/database/dto/redis-info.dto';

@Injectable()
export class DatabaseAnalytics extends TelemetryBaseService {
  constructor(protected eventEmitter: EventEmitter2) {
    super(eventEmitter);
  }

  sendConnectionFailedEvent(instance: Database, exception: HttpException): void {
    this.sendFailedEvent(
      TelemetryEvents.RedisInstanceConnectionFailed,
      exception,
      { databaseId: instance.id },
    );
  }

  sendInstanceAddedEvent(
    instance: Database,
    additionalInfo?: RedisDatabaseInfoResponse,
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
          verifyTLSCertificate: instance?.verifyServerCert
            ? 'enabled'
            : 'disabled',
          useTLSAuthClients: instance?.clientCert
            ? 'enabled'
            : 'disabled',
          useSNI: instance?.tlsServername ? 'enabled' : 'disabled',
          useSSH: instance?.ssh ? 'enabled' : 'disabled',
          version: additionalInfo?.version,
          numberOfKeys: additionalInfo?.totalKeys,
          numberOfKeysRange: getRangeForNumber(additionalInfo?.totalKeys, TOTAL_KEYS_BREAKPOINTS),
          totalMemory: additionalInfo.usedMemory,
          numberedDatabases: additionalInfo.databases,
          numberOfModules: instance.modules?.length || 0,
          timeout: instance.timeout / 1_000, // milliseconds to seconds
          databaseIndex: instance.db || 0,
          useDecompression: instance.compressor || null,
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
    prev: Database,
    cur: Database,
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
            verifyTLSCertificate: cur?.verifyServerCert
              ? 'enabled'
              : 'disabled',
            useTLSAuthClients: cur?.clientCert ? 'enabled' : 'disabled',
            useSNI: cur?.tlsServername ? 'enabled' : 'disabled',
            useSSH: cur?.ssh ? 'enabled' : 'disabled',
            timeout: cur?.timeout / 1_000, // milliseconds to seconds
            useDecompression: cur?.compressor || null,
            previousValues: {
              connectionType: prev.connectionType,
              provider: prev.provider,
              useTLS: prev.tls ? 'enabled' : 'disabled',
              useSNI: prev?.tlsServername ? 'enabled' : 'disabled',
              useSSH: prev?.ssh ? 'enabled' : 'disabled',
              verifyTLSCertificate: prev?.verifyServerCert
                ? 'enabled'
                : 'disabled',
              useTLSAuthClients: prev?.clientCert
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

  sendInstanceDeletedEvent(instance: Database): void {
    this.sendEvent(
      TelemetryEvents.RedisInstanceDeleted,
      {
        databaseId: instance.id,
        provider: instance.provider,
      },
    );
  }

  sendDatabaseConnectedClientListEvent(instanceId: string, additionalData: object = {}): void {
    try {
      this.sendEvent(
        TelemetryEvents.DatabaseConnectedClientList,
        {
          instanceId,
          ...additionalData,
        },
      );
    } catch (e) {
      // continue regardless of error
    }
  }
}
