import { InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { mockCaCertEntity, mockClientCertEntity, mockStandaloneDatabaseEntity } from 'src/__mocks__';
import { TelemetryEvents } from 'src/constants';
import { DatabaseInstanceResponse } from 'src/modules/instances/dto/database-instance.dto';
import { HostingProvider } from 'src/modules/core/models/database-instance.entity';
import {
  mockRedisGeneralInfo,
} from 'src/modules/shared/services/configuration-business/configuration-business.service.spec';
import { InstancesAnalyticsService } from './instances-analytics.service';

const mockDatabaseInstanceDto: DatabaseInstanceResponse = {
  id: mockStandaloneDatabaseEntity.id,
  nameFromProvider: null,
  provider: HostingProvider.LOCALHOST,
  connectionType: mockStandaloneDatabaseEntity.connectionType,
  lastConnection: mockStandaloneDatabaseEntity.lastConnection,
  host: mockStandaloneDatabaseEntity.host,
  port: mockStandaloneDatabaseEntity.port,
  name: mockStandaloneDatabaseEntity.name,
  username: mockStandaloneDatabaseEntity.username,
  password: mockStandaloneDatabaseEntity.password,
  tls: {
    verifyServerCert: true,
    caCertId: mockCaCertEntity.id,
    clientCertPairId: mockClientCertEntity.id,
  },
  modules: [],
};
describe('InstancesAnalytics', () => {
  let service: InstancesAnalyticsService;
  let sendEventMethod;
  let sendFailedEventMethod;
  const httpException = new InternalServerErrorException();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventEmitter2,
        InstancesAnalyticsService,
      ],
    }).compile();

    service = await module.get<InstancesAnalyticsService>(InstancesAnalyticsService);
    sendEventMethod = jest.spyOn<InstancesAnalyticsService, any>(
      service,
      'sendEvent',
    );
    sendFailedEventMethod = jest.spyOn<InstancesAnalyticsService, any>(
      service,
      'sendFailedEvent',
    );
  });

  describe('sendInstanceListReceivedEvent', () => {
    const instance = mockDatabaseInstanceDto;
    it('should emit event with one db in the list', () => {
      service.sendInstanceListReceivedEvent([instance]);

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.RedisInstanceListReceived,
        {
          numberOfDatabases: 1,
        },
      );
    });
    it('should emit event with several dbs in the list', () => {
      service.sendInstanceListReceivedEvent([instance, instance, instance]);

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.RedisInstanceListReceived,
        {
          numberOfDatabases: 3,
        },
      );
    });
    it('should emit event with several empty in the list', () => {
      service.sendInstanceListReceivedEvent([]);

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.RedisInstanceListReceived,
        {
          numberOfDatabases: 0,
        },
      );
    });
    it('should emit event with additional data', () => {
      service.sendInstanceListReceivedEvent([], { data: 'data' });

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.RedisInstanceListReceived,
        {
          numberOfDatabases: 0,
          data: 'data',
        },
      );
    });
  });

  describe('sendInstanceAddedEvent', () => {
    it('should emit event with enabled tls', () => {
      const instance = mockDatabaseInstanceDto;
      service.sendInstanceAddedEvent(instance, mockRedisGeneralInfo);

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.RedisInstanceAdded,
        {
          databaseId: instance.id,
          connectionType: instance.connectionType,
          provider: instance.provider,
          useTLS: 'enabled',
          verifyTLSCertificate: 'enabled',
          useTLSAuthClients: 'enabled',
          version: mockRedisGeneralInfo.version,
          numberOfKeys: mockRedisGeneralInfo.totalKeys,
          numberOfKeysRange: '0 - 500 000',
          totalMemory: mockRedisGeneralInfo.usedMemory,
          numberedDatabases: mockRedisGeneralInfo.databases,
          numberOfModules: 0,
          modules: [],
        },
      );
    });
    it('should emit event with disabled tls', () => {
      const instance = {
        ...mockDatabaseInstanceDto,
        tls: undefined,
      };
      service.sendInstanceAddedEvent(instance, mockRedisGeneralInfo);

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.RedisInstanceAdded,
        {
          databaseId: instance.id,
          connectionType: instance.connectionType,
          provider: instance.provider,
          useTLS: 'disabled',
          verifyTLSCertificate: 'disabled',
          useTLSAuthClients: 'disabled',
          version: mockRedisGeneralInfo.version,
          numberOfKeys: mockRedisGeneralInfo.totalKeys,
          numberOfKeysRange: '0 - 500 000',
          totalMemory: mockRedisGeneralInfo.usedMemory,
          numberedDatabases: mockRedisGeneralInfo.databases,
          numberOfModules: 0,
          modules: [],
        },
      );
    });
    it('should emit event without additional info', () => {
      const instance = { ...mockDatabaseInstanceDto, modules: [{ name: 'search', version: 20000 }] };
      service.sendInstanceAddedEvent(instance, {
        version: mockRedisGeneralInfo.version,
      });

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.RedisInstanceAdded,
        {
          databaseId: instance.id,
          connectionType: instance.connectionType,
          provider: instance.provider,
          useTLS: 'enabled',
          verifyTLSCertificate: 'enabled',
          useTLSAuthClients: 'enabled',
          version: mockRedisGeneralInfo.version,
          numberOfKeys: undefined,
          numberOfKeysRange: undefined,
          totalMemory: undefined,
          numberedDatabases: undefined,
          numberOfModules: 1,
          modules: [{ name: 'search', version: 20000 }],
        },
      );
    });
  });

  describe('sendInstanceEditedEvent', () => {
    it('should emit event for manual update by user with disabled tls', () => {
      const prev = mockDatabaseInstanceDto;
      const cur = {
        ...mockDatabaseInstanceDto,
        provider: HostingProvider.RE_CLUSTER,
        tls: undefined,
      };
      service.sendInstanceEditedEvent(prev, cur);

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.RedisInstanceEditedByUser,
        {
          databaseId: cur.id,
          connectionType: cur.connectionType,
          provider: HostingProvider.RE_CLUSTER,
          useTLS: 'disabled',
          verifyTLSCertificate: 'disabled',
          useTLSAuthClients: 'disabled',
          previousValues: {
            connectionType: prev.connectionType,
            provider: prev.provider,
            useTLS: 'enabled',
            verifyTLSCertificate: 'enabled',
            useTLSAuthClients: 'enabled',
          },
        },
      );
    });
    it('should emit event for manual update by user with enabled tls', () => {
      const prev = {
        ...mockDatabaseInstanceDto,
        tls: undefined,
      };
      const cur = {
        ...mockDatabaseInstanceDto,
        provider: HostingProvider.RE_CLUSTER,
      };
      service.sendInstanceEditedEvent(prev, cur);

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.RedisInstanceEditedByUser,
        {
          databaseId: cur.id,
          connectionType: cur.connectionType,
          provider: HostingProvider.RE_CLUSTER,
          useTLS: 'enabled',
          verifyTLSCertificate: 'enabled',
          useTLSAuthClients: 'enabled',
          previousValues: {
            connectionType: prev.connectionType,
            provider: prev.provider,
            useTLS: 'disabled',
            verifyTLSCertificate: 'disabled',
            useTLSAuthClients: 'disabled',
          },
        },
      );
    });
    it('should not emit event if instance updated not by user', () => {
      const prev = mockDatabaseInstanceDto;
      const cur = {
        ...mockDatabaseInstanceDto,
        provider: HostingProvider.RE_CLUSTER,
        tls: undefined,
      };
      service.sendInstanceEditedEvent(prev, cur, false);

      expect(sendEventMethod).not.toHaveBeenCalled();
    });
  });

  describe('sendInstanceAddFailedEvent', () => {
    it('should emit AddFailed event', () => {
      service.sendInstanceAddFailedEvent(httpException);

      expect(sendFailedEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.RedisInstanceAddFailed,
        httpException,
      );
    });
  });

  describe('sendInstanceDeletedEvent', () => {
    it('should emit Deleted event', () => {
      service.sendInstanceDeletedEvent(mockDatabaseInstanceDto);

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.RedisInstanceDeleted,
        {
          databaseId: mockDatabaseInstanceDto.id,
        },
      );
    });
  });

  describe('sendConnectionFailedEvent', () => {
    it('should emit ConnectionFailed event', () => {
      service.sendConnectionFailedEvent(mockDatabaseInstanceDto, httpException);

      expect(sendFailedEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.RedisInstanceConnectionFailed,
        httpException,
        {
          databaseId: mockDatabaseInstanceDto.id,
        },
      );
    });
  });
});
