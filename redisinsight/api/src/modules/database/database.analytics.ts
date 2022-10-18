import { HttpException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TelemetryBaseService } from 'src/modules/shared/services/base/telemetry.base.service';
import { Database } from 'src/modules/database/models/database';
import { TelemetryEvents } from 'src/constants';
import { DatabaseInstanceResponse } from 'src/modules/instances/dto/database-instance.dto';

@Injectable()
export class DatabaseAnalytics extends TelemetryBaseService {
  constructor(protected eventEmitter: EventEmitter2) {
    super(eventEmitter);
  }

  sendInstanceListReceivedEvent(
    databases: Database[],
    additionalData: object = {},
  ): void {
    try {
      this.sendEvent(
        TelemetryEvents.RedisInstanceListReceived,
        {
          numberOfDatabases: databases.length,
          ...additionalData,
        },
      );
    } catch (e) {
      // continue regardless of error
    }
  }

  sendConnectionFailedEvent(instance: DatabaseInstanceResponse | Database, exception: HttpException): void {
    this.sendFailedEvent(
      TelemetryEvents.RedisInstanceConnectionFailed,
      exception,
      { databaseId: instance.id },
    );
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
            previousValues: {
              connectionType: prev.connectionType,
              provider: prev.provider,
              useTLS: prev.tls ? 'enabled' : 'disabled',
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
}
