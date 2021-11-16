import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { mockStandaloneDatabaseEntity } from 'src/__mocks__';
import { TelemetryEvents } from 'src/constants';
import { RedisDataType } from 'src/modules/browser/dto';
import { BrowserAnalyticsService } from './browser-analytics.service';

const instanceId = mockStandaloneDatabaseEntity.id;
const mockAddedEventProperties = '["foo"]["bar"]';

describe('BrowserAnalyticsService', () => {
  let service: BrowserAnalyticsService;
  let sendEventMethod;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventEmitter2,
        BrowserAnalyticsService,
      ],
    }).compile();

    service = await module.get<BrowserAnalyticsService>(
      BrowserAnalyticsService,
    );
    sendEventMethod = jest.spyOn<BrowserAnalyticsService, any>(
      service,
      'sendEvent',
    );
  });

  describe('sendKeysScannedEvent', () => {
    it('should emit event without filters', () => {
      service.sendKeysScannedEvent(instanceId, '*');

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.BrowserKeysScanned,
        {
          databaseId: instanceId,
        },
      );
    });
    it('should emit event with filter by patter', () => {
      service.sendKeysScannedEvent(instanceId, 'string*');

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.BrowserKeysScannedWithFilters,
        {
          databaseId: instanceId,
          match: 'PATTERN',
        },
      );
    });
    it('should emit event with filter by exact key name', () => {
      service.sendKeysScannedEvent(instanceId, 'string');

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.BrowserKeysScannedWithFilters,
        {
          databaseId: instanceId,
          match: 'EXACT_KEY_NAME',
        },
      );
    });
    it('should emit event with filter by key type', () => {
      service.sendKeysScannedEvent(instanceId, '*', RedisDataType.String);

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.BrowserKeysScannedWithFilters,
        {
          databaseId: instanceId,
          keyType: RedisDataType.String,
          match: '*',
        },
      );
    });
    it('should emit event with filter by key type and pattern', () => {
      service.sendKeysScannedEvent(
        instanceId,
        'string*',
        RedisDataType.String,
        { count: 200 },
      );

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.BrowserKeysScannedWithFilters,
        {
          databaseId: instanceId,
          match: 'PATTERN',
          keyType: RedisDataType.String,
          count: 200,
        },
      );
    });
  });

  describe('sendKeyAddedEvent', () => {
    it('should emit KeyAdded event', () => {
      service.sendKeyAddedEvent(instanceId, RedisDataType.String);

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.BrowserKeyAdded,
        {
          databaseId: instanceId,
          keyType: RedisDataType.String,
        },
      );
    });
    it('should emit KeyAdded event with additional data', () => {
      service.sendKeyAddedEvent(instanceId, RedisDataType.String, { TTL: -1 });

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.BrowserKeyAdded,
        {
          databaseId: instanceId,
          keyType: RedisDataType.String,
          TTL: -1,
        },
      );
    });
  });

  describe('sendKeyTTLChangedEvent', () => {
    it('should emit KeyTTLChanged event', () => {
      service.sendKeyTTLChangedEvent(instanceId, 200, -1);

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.BrowserKeyTTLChanged,
        {
          databaseId: instanceId,
          TTL: 200,
          previousTTL: -1,
        },
      );
    });
  });

  describe('sendKeysDeletedEvent', () => {
    it('should emit KeyTTLChanged event', () => {
      service.sendKeysDeletedEvent(instanceId, 10);

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.BrowserKeysDeleted,
        {
          databaseId: instanceId,
          numberOfDeletedKeys: 10,
        },
      );
    });
  });

  describe('sendKeyValueAddedEvent', () => {
    it('should emit KeyValueAdded event', () => {
      service.sendKeyValueAddedEvent(instanceId, RedisDataType.List);

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.BrowserKeyValueAdded,
        {
          databaseId: instanceId,
          keyType: RedisDataType.List,
        },
      );
    });
    it('should emit KeyValueAdded event with additional data', () => {
      service.sendKeyValueAddedEvent(instanceId, RedisDataType.List, {
        numberOfAdded: 1,
      });

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.BrowserKeyValueAdded,
        {
          databaseId: instanceId,
          numberOfAdded: 1,
          keyType: RedisDataType.List,
        },
      );
    });
  });

  describe('sendKeyValueEditedEvent', () => {
    it('should emit KeyValueEdited event', () => {
      service.sendKeyValueEditedEvent(instanceId, RedisDataType.List);

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.BrowserKeyValueEdited,
        {
          databaseId: instanceId,
          keyType: RedisDataType.List,
        },
      );
    });
    it('should emit KeyValueEdited event with additional data', () => {
      service.sendKeyValueEditedEvent(instanceId, RedisDataType.List, {
        numberOfEdited: 1,
      });

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.BrowserKeyValueEdited,
        {
          databaseId: instanceId,
          keyType: RedisDataType.List,
          numberOfEdited: 1,
        },
      );
    });
  });

  describe('sendKeyValueRemovedEvent', () => {
    it('should emit KeyValueRemoved event', () => {
      service.sendKeyValueRemovedEvent(instanceId, RedisDataType.List);

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.BrowserKeyValueRemoved,
        {
          databaseId: instanceId,
          keyType: RedisDataType.List,
        },
      );
    });
    it('should emit event KeyValueRemoved with additional data', () => {
      service.sendKeyValueRemovedEvent(instanceId, RedisDataType.List, {
        numberOfRemoved: 1,
      });

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.BrowserKeyValueRemoved,
        {
          databaseId: instanceId,
          keyType: RedisDataType.List,
          numberOfRemoved: 1,
        },
      );
    });
  });

  describe('sendKeyScannedEvent', () => {
    it('should emit KeyScanned event with filter by exact name', () => {
      service.sendKeyScannedEvent(instanceId, RedisDataType.Hash, 'member');

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.BrowserKeyValueFiltered,
        {
          databaseId: instanceId,
          keyType: RedisDataType.Hash,
          match: 'EXACT_VALUE_NAME',
        },
      );
    });
    it('should emit KeyScanned event with filter by pattern', () => {
      service.sendKeyScannedEvent(instanceId, RedisDataType.Hash, 'member*');

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.BrowserKeyValueFiltered,
        {
          databaseId: instanceId,
          keyType: RedisDataType.Hash,
          match: 'PATTERN',
        },
      );
    });
    it('should emit KeyScanned event with additional data', () => {
      service.sendKeyScannedEvent(instanceId, RedisDataType.Hash, 'member*', {
        length: 10,
      });

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.BrowserKeyValueFiltered,
        {
          databaseId: instanceId,
          keyType: RedisDataType.Hash,
          match: 'PATTERN',
          length: 10,
        },
      );
    });
    it('should not emit event', () => {
      service.sendKeyScannedEvent(instanceId, RedisDataType.Hash, '*');

      expect(sendEventMethod).not.toHaveBeenCalled();
    });
  });

  describe('sendGetListElementByIndexEvent', () => {
    it('should emit GetListElementByIndex event', () => {
      service.sendGetListElementByIndexEvent(instanceId);

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.BrowserKeyValueFiltered,
        {
          databaseId: instanceId,
          keyType: RedisDataType.List,
          match: 'EXACT_VALUE_NAME',
        },
      );
    });
    it('should emit GetListElementByIndex event with additional data', () => {
      service.sendGetListElementByIndexEvent(instanceId, {
        length: 10,
      });

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.BrowserKeyValueFiltered,
        {
          databaseId: instanceId,
          keyType: RedisDataType.List,
          match: 'EXACT_VALUE_NAME',
          length: 10,
        },
      );
    });
  });

  describe('sendJsonPropertyAddedEvent', () => {
    it('should emit JsonPropertyAdded event', () => {
      service.sendJsonPropertyAddedEvent(instanceId, mockAddedEventProperties);

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.BrowserJSONPropertyAdded,
        {
          databaseId: instanceId,
          keyLevel: '1',
        },
      );
    });
    it('should emit JsonPropertyAdded event with additional data', () => {
      service.sendJsonPropertyAddedEvent(instanceId, mockAddedEventProperties, {
        length: 10,
      });

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.BrowserJSONPropertyAdded,
        {
          databaseId: instanceId,
          keyLevel: '1',
          length: 10,
        },
      );
    });
  });

  describe('sendJsonPropertyEditedEvent', () => {
    it('should emit JsonPropertyEdited event', () => {
      service.sendJsonPropertyEditedEvent(instanceId, mockAddedEventProperties);

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.BrowserJSONPropertyEdited,
        {
          databaseId: instanceId,
          keyLevel: '1',
        },
      );
    });
    it('should emit JsonPropertyEdited event with additional data', () => {
      service.sendJsonPropertyEditedEvent(instanceId, mockAddedEventProperties, {
        length: 10,
      });

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.BrowserJSONPropertyEdited,
        {
          databaseId: instanceId,
          keyLevel: '1',
          length: 10,
        },
      );
    });
  });

  describe('sendJsonPropertyDeletedEvent', () => {
    it('should emit JsonPropertyDeleted event', () => {
      service.sendJsonPropertyDeletedEvent(instanceId, mockAddedEventProperties);

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.BrowserJSONPropertyDeleted,
        {
          databaseId: instanceId,
          keyLevel: '1',
        },
      );
    });
    it('should emit JsonPropertyDeleted event with additional data', () => {
      service.sendJsonPropertyDeletedEvent(instanceId, mockAddedEventProperties, {
        length: 10,
      });

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.BrowserJSONPropertyDeleted,
        {
          databaseId: instanceId,
          keyLevel: '1',
          length: 10,
        },
      );
    });
  });

  describe('sendJsonArrayPropertyAppendEven', () => {
    it('should emit JsonArrayPropertyAppend event on append element to root', () => {
      service.sendJsonArrayPropertyAppendEvent(instanceId, '.');

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.BrowserJSONPropertyAdded,
        {
          databaseId: instanceId,
          keyLevel: '0',
        },
      );
    });
    it('should emit JsonArrayPropertyAppend event on append element to key at deep level', () => {
      service.sendJsonArrayPropertyAppendEvent(instanceId, mockAddedEventProperties);

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.BrowserJSONPropertyAdded,
        {
          databaseId: instanceId,
          keyLevel: '2',
        },
      );
    });
    it('should emit JsonArrayPropertyAppend event with additional data', () => {
      service.sendJsonArrayPropertyAppendEvent(instanceId, mockAddedEventProperties, {
        length: 10,
      });

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.BrowserJSONPropertyAdded,
        {
          databaseId: instanceId,
          keyLevel: '2',
          length: 10,
        },
      );
    });
  });
});
