import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as isGlob from 'is-glob';
import { TelemetryEvents } from 'src/constants';
import { RedisDataType } from 'src/modules/browser/dto';
import { getJsonPathLevel } from 'src/utils';
import { TelemetryBaseService } from 'src/modules/shared/services/base/telemetry.base.service';

@Injectable()
export class BrowserAnalyticsService extends TelemetryBaseService {
  constructor(protected eventEmitter: EventEmitter2) {
    super(eventEmitter);
  }

  sendKeysScannedEvent(
    instanceId: string,
    match: string = '*',
    keyType?: RedisDataType,
    additionalData?: object,
  ): void {
    try {
      if (match !== '*' || keyType) {
        let matchValue = '*';
        if (match !== '*') {
          matchValue = !isGlob(match, { strict: false })
            ? 'EXACT_KEY_NAME'
            : 'PATTERN';
        }
        this.sendEvent(
          TelemetryEvents.BrowserKeysScannedWithFilters,
          {
            databaseId: instanceId,
            match: matchValue,
            keyType,
            ...additionalData,
          },
        );
      } else {
        this.sendEvent(
          TelemetryEvents.BrowserKeysScanned,
          {
            databaseId: instanceId,
            ...additionalData,
          },
        );
      }
    } catch (e) {
      // continue regardless of error
    }
  }

  sendKeyAddedEvent(
    instanceId: string,
    keyType: RedisDataType,
    additionalData: object = {},
  ): void {
    this.sendEvent(
      TelemetryEvents.BrowserKeyAdded,
      {
        databaseId: instanceId,
        keyType,
        ...additionalData,
      },
    );
  }

  sendKeyTTLChangedEvent(
    instanceId: string,
    TTL: number,
    previousTTL: number,
  ): void {
    this.sendEvent(
      TelemetryEvents.BrowserKeyTTLChanged,
      {
        databaseId: instanceId,
        TTL,
        previousTTL,
      },
    );
  }

  sendKeysDeletedEvent(instanceId: string, numberOfDeletedKeys: number): void {
    this.sendEvent(
      TelemetryEvents.BrowserKeysDeleted,
      {
        databaseId: instanceId,
        numberOfDeletedKeys,
      },
    );
  }

  sendKeyValueAddedEvent(
    instanceId: string,
    keyType: RedisDataType,
    additionalData: object = {},
  ): void {
    this.sendEvent(
      TelemetryEvents.BrowserKeyValueAdded,
      {
        databaseId: instanceId,
        keyType,
        ...additionalData,
      },
    );
  }

  sendKeyValueEditedEvent(
    instanceId: string,
    keyType: RedisDataType,
    additionalData: object = {},
  ): void {
    this.sendEvent(
      TelemetryEvents.BrowserKeyValueEdited,
      {
        databaseId: instanceId,
        keyType,
        ...additionalData,
      },
    );
  }

  sendKeyValueRemovedEvent(
    instanceId: string,
    keyType: RedisDataType,
    additionalData: object = {},
  ): void {
    this.sendEvent(
      TelemetryEvents.BrowserKeyValueRemoved,
      {
        databaseId: instanceId,
        keyType,
        ...additionalData,
      },
    );
  }

  sendKeyScannedEvent(
    instanceId: string,
    keyType: RedisDataType,
    match: string = '*',
    additionalData: object = {},
  ): void {
    try {
      if (match !== '*') {
        const matchValue = !isGlob(match, { strict: false })
          ? 'EXACT_VALUE_NAME'
          : 'PATTERN';
        this.sendEvent(
          TelemetryEvents.BrowserKeyValueFiltered,
          {
            databaseId: instanceId,
            keyType,
            match: matchValue,
            ...additionalData,
          },
        );
      }
    } catch (e) {
      // continue regardless of error
    }
  }

  sendGetListElementByIndexEvent(instanceId: string, additionalData: object = {}): void {
    this.sendEvent(
      TelemetryEvents.BrowserKeyValueFiltered,
      {
        databaseId: instanceId,
        keyType: RedisDataType.List,
        match: 'EXACT_VALUE_NAME',
        ...additionalData,
      },
    );
  }

  sendJsonPropertyAddedEvent(
    instanceId: string,
    path: string,
    additionalData: object = {},
  ): void {
    try {
      this.sendEvent(
        TelemetryEvents.BrowserJSONPropertyAdded,
        {
          databaseId: instanceId,
          keyLevel: getJsonPathLevel(path),
          ...additionalData,
        },
      );
    } catch (e) {
      // continue regardless of error
    }
  }

  sendJsonArrayPropertyAppendEvent(
    instanceId: string,
    path: string,
    additionalData: object = {},
  ): void {
    try {
      // An array element is appended using the path of the parent key.
      // And we need to increase the keyLevel by one to get it for child element.
      const keyLevel = path === '.' ? '0' : getJsonPathLevel(`${path}[0]`);
      this.sendEvent(
        TelemetryEvents.BrowserJSONPropertyAdded,
        {
          databaseId: instanceId,
          keyLevel,
          ...additionalData,
        },
      );
    } catch (e) {
      // continue regardless of error
    }
  }

  sendJsonPropertyEditedEvent(
    instanceId: string,
    path: string,
    additionalData: object = {},
  ): void {
    try {
      this.sendEvent(
        TelemetryEvents.BrowserJSONPropertyEdited,
        {
          databaseId: instanceId,
          keyLevel: getJsonPathLevel(path),
          ...additionalData,
        },
      );
    } catch (e) {
      // continue regardless of error
    }
  }

  sendJsonPropertyDeletedEvent(
    instanceId: string,
    path: string,
    additionalData: object = {},
  ): void {
    try {
      this.sendEvent(
        TelemetryEvents.BrowserJSONPropertyDeleted,
        {
          databaseId: instanceId,
          keyLevel: getJsonPathLevel(path),
          ...additionalData,
        },
      );
    } catch (e) {
      // continue regardless of error
    }
  }
}
