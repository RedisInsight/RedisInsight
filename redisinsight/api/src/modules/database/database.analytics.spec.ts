import { InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  mockDatabase,
  mockDatabaseWithTlsAuth,
  mockRedisGeneralInfo,
} from 'src/__mocks__';
import { TelemetryEvents } from 'src/constants';
import { DEFAULT_SUMMARY as DEFAULT_REDIS_MODULES_SUMMARY } from 'src/utils/redis-modules-summary';
import { DatabaseAnalytics } from 'src/modules/database/database.analytics';
import { HostingProvider } from 'src/modules/database/entities/database.entity';

describe('DatabaseAnalytics', () => {
  let service: DatabaseAnalytics;
  let sendEventSpy;
  let sendFailedEventSpy;
  const httpException = new InternalServerErrorException();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventEmitter2,
        DatabaseAnalytics,
      ],
    }).compile();

    service = await module.get(DatabaseAnalytics);
    sendEventSpy = jest.spyOn(service as any, 'sendEvent');
    sendFailedEventSpy = jest.spyOn(service as any, 'sendFailedEvent');
  });

  describe('sendInstanceListReceivedEvent', () => {
    it('should emit event with one db in the list', () => {
      service.sendInstanceListReceivedEvent([mockDatabaseWithTlsAuth]);

      expect(sendEventSpy).toHaveBeenCalledWith(
        TelemetryEvents.RedisInstanceListReceived,
        {
          numberOfDatabases: 1,
        },
      );
    });
    it('should emit event with several dbs in the list', () => {
      service.sendInstanceListReceivedEvent([
        mockDatabaseWithTlsAuth,
        mockDatabaseWithTlsAuth,
        mockDatabaseWithTlsAuth,
      ]);

      expect(sendEventSpy).toHaveBeenCalledWith(
        TelemetryEvents.RedisInstanceListReceived,
        {
          numberOfDatabases: 3,
        },
      );
    });
    it('should emit event with several empty in the list', () => {
      service.sendInstanceListReceivedEvent([]);

      expect(sendEventSpy).toHaveBeenCalledWith(
        TelemetryEvents.RedisInstanceListReceived,
        {
          numberOfDatabases: 0,
        },
      );
    });
    it('should emit event with additional data', () => {
      service.sendInstanceListReceivedEvent([], { data: 'data' });

      expect(sendEventSpy).toHaveBeenCalledWith(
        TelemetryEvents.RedisInstanceListReceived,
        {
          numberOfDatabases: 0,
          data: 'data',
        },
      );
    });
  });

  describe('sendInstanceAddedEvent', () => {
    it('should emit event with enabled tls and sni, and ssh', () => {
      service.sendInstanceAddedEvent({
        ...mockDatabaseWithTlsAuth,
        ssh: true,
      }, mockRedisGeneralInfo);

      expect(sendEventSpy).toHaveBeenCalledWith(
        TelemetryEvents.RedisInstanceAdded,
        {
          databaseId: mockDatabaseWithTlsAuth.id,
          connectionType: mockDatabaseWithTlsAuth.connectionType,
          provider: mockDatabaseWithTlsAuth.provider,
          useTLS: 'enabled',
          verifyTLSCertificate: 'enabled',
          useTLSAuthClients: 'enabled',
          useSNI: 'enabled',
          useSSH: 'enabled',
          version: mockRedisGeneralInfo.version,
          numberOfKeys: mockRedisGeneralInfo.totalKeys,
          numberOfKeysRange: '0 - 500 000',
          totalMemory: mockRedisGeneralInfo.usedMemory,
          numberedDatabases: mockRedisGeneralInfo.databases,
          numberOfModules: 0,
          timeout: mockDatabaseWithTlsAuth.timeout / 1_000, // milliseconds to seconds
          databaseIndex: 0,
          ...DEFAULT_REDIS_MODULES_SUMMARY,
        },
      );
    });
    it('should emit event with disabled tls and sni', () => {
      const instance = {
        ...mockDatabase,
      };

      service.sendInstanceAddedEvent(instance, mockRedisGeneralInfo);

      expect(sendEventSpy).toHaveBeenCalledWith(
        TelemetryEvents.RedisInstanceAdded,
        {
          databaseId: instance.id,
          connectionType: instance.connectionType,
          provider: instance.provider,
          useTLS: 'disabled',
          verifyTLSCertificate: 'disabled',
          useTLSAuthClients: 'disabled',
          useSNI: 'disabled',
          useSSH: 'disabled',
          version: mockRedisGeneralInfo.version,
          numberOfKeys: mockRedisGeneralInfo.totalKeys,
          numberOfKeysRange: '0 - 500 000',
          totalMemory: mockRedisGeneralInfo.usedMemory,
          numberedDatabases: mockRedisGeneralInfo.databases,
          numberOfModules: 0,
          timeout: mockDatabaseWithTlsAuth.timeout / 1_000, // milliseconds to seconds
          databaseIndex: 0,
          ...DEFAULT_REDIS_MODULES_SUMMARY,
        },
      );
    });
    it('should emit event without additional info', () => {
      const instance = {
        ...mockDatabaseWithTlsAuth,
        modules: [{ name: 'search', version: 20000 }, { name: 'rediSQL', version: 1 }],
      };
      service.sendInstanceAddedEvent(instance, {
        version: mockRedisGeneralInfo.version,
      });

      expect(sendEventSpy).toHaveBeenCalledWith(
        TelemetryEvents.RedisInstanceAdded,
        {
          databaseId: instance.id,
          connectionType: instance.connectionType,
          provider: instance.provider,
          useTLS: 'enabled',
          verifyTLSCertificate: 'enabled',
          useTLSAuthClients: 'enabled',
          useSNI: 'enabled',
          useSSH: 'disabled',
          version: mockRedisGeneralInfo.version,
          numberOfKeys: undefined,
          numberOfKeysRange: undefined,
          totalMemory: undefined,
          numberedDatabases: undefined,
          numberOfModules: 2,
          timeout: mockDatabaseWithTlsAuth.timeout / 1_000, // milliseconds to seconds
          databaseIndex: 0,
          ...DEFAULT_REDIS_MODULES_SUMMARY,
          RediSearch: {
            loaded: true,
            version: 20000,
          },
          customModules: [{ name: 'rediSQL', version: 1 }],
        },
      );
    });
    it('should emit event without db index', () => {
      const instance = {
        ...mockDatabaseWithTlsAuth,
        db: 2,
        modules: [{ name: 'search', version: 20000 }, { name: 'rediSQL', version: 1 }],
      };
      service.sendInstanceAddedEvent(instance, {
        version: mockRedisGeneralInfo.version,
      });

      expect(sendEventSpy).toHaveBeenCalledWith(
        TelemetryEvents.RedisInstanceAdded,
        {
          databaseId: instance.id,
          connectionType: instance.connectionType,
          provider: instance.provider,
          useTLS: 'enabled',
          verifyTLSCertificate: 'enabled',
          useTLSAuthClients: 'enabled',
          useSNI: 'enabled',
          useSSH: 'disabled',
          version: mockRedisGeneralInfo.version,
          numberOfKeys: undefined,
          numberOfKeysRange: undefined,
          totalMemory: undefined,
          numberedDatabases: undefined,
          numberOfModules: 2,
          timeout: mockDatabaseWithTlsAuth.timeout / 1_000, // milliseconds to seconds
          databaseIndex: 2,
          ...DEFAULT_REDIS_MODULES_SUMMARY,
          RediSearch: {
            loaded: true,
            version: 20000,
          },
          customModules: [{ name: 'rediSQL', version: 1 }],
        },
      );
    });
  });

  describe('sendInstanceEditedEvent', () => {
    it('should emit event for manual update by user with disabled tls', () => {
      const prev = mockDatabaseWithTlsAuth;
      const cur = {
        ...mockDatabaseWithTlsAuth,
        provider: HostingProvider.RE_CLUSTER,
        tls: undefined,
        verifyServerCert: false,
        caCert: null,
        clientCert: null,
      };
      service.sendInstanceEditedEvent(prev, cur);

      expect(sendEventSpy).toHaveBeenCalledWith(
        TelemetryEvents.RedisInstanceEditedByUser,
        {
          databaseId: cur.id,
          connectionType: cur.connectionType,
          provider: HostingProvider.RE_CLUSTER,
          useTLS: 'disabled',
          verifyTLSCertificate: 'disabled',
          useTLSAuthClients: 'disabled',
          useSNI: 'enabled',
          useSSH: 'disabled',
          timeout: mockDatabaseWithTlsAuth.timeout / 1_000, // milliseconds to seconds
          previousValues: {
            connectionType: prev.connectionType,
            provider: prev.provider,
            useTLS: 'enabled',
            verifyTLSCertificate: 'enabled',
            useTLSAuthClients: 'enabled',
            useSNI: 'enabled',
            useSSH: 'disabled',
          },
        },
      );
    });
    it('should emit event for manual update by user with enabled tls', () => {
      const prev = {
        ...mockDatabase,
        tls: undefined,
      };
      const cur = {
        ...mockDatabaseWithTlsAuth,
        provider: HostingProvider.RE_CLUSTER,
      };
      service.sendInstanceEditedEvent(prev, cur);

      expect(sendEventSpy).toHaveBeenCalledWith(
        TelemetryEvents.RedisInstanceEditedByUser,
        {
          databaseId: cur.id,
          connectionType: cur.connectionType,
          provider: HostingProvider.RE_CLUSTER,
          useTLS: 'enabled',
          verifyTLSCertificate: 'enabled',
          useTLSAuthClients: 'enabled',
          useSNI: 'enabled',
          useSSH: 'disabled',
          timeout: mockDatabaseWithTlsAuth.timeout / 1_000, // milliseconds to seconds
          previousValues: {
            connectionType: prev.connectionType,
            provider: prev.provider,
            useTLS: 'disabled',
            useSNI: 'disabled',
            useSSH: 'disabled',
            verifyTLSCertificate: 'disabled',
            useTLSAuthClients: 'disabled',
          },
        },
      );
    });
    it('should not emit event if instance updated not by user', () => {
      const prev = mockDatabaseWithTlsAuth;
      const cur = {
        ...mockDatabase,
        provider: HostingProvider.RE_CLUSTER,
        tls: undefined,
      };
      service.sendInstanceEditedEvent(prev, cur, false);

      expect(sendEventSpy).not.toHaveBeenCalled();
    });
  });

  describe('sendInstanceAddFailedEvent', () => {
    it('should emit AddFailed event', () => {
      service.sendInstanceAddFailedEvent(httpException);

      expect(sendFailedEventSpy).toHaveBeenCalledWith(
        TelemetryEvents.RedisInstanceAddFailed,
        httpException,
      );
    });
  });

  describe('sendInstanceDeletedEvent', () => {
    it('should emit Deleted event', () => {
      service.sendInstanceDeletedEvent(mockDatabase);

      expect(sendEventSpy).toHaveBeenCalledWith(
        TelemetryEvents.RedisInstanceDeleted,
        {
          databaseId: mockDatabase.id,
          provider: mockDatabase.provider,
        },
      );
    });
  });

  describe('sendConnectionFailedEvent', () => {
    it('should emit ConnectionFailed event', () => {
      service.sendConnectionFailedEvent(mockDatabase, httpException);

      expect(sendFailedEventSpy).toHaveBeenCalledWith(
        TelemetryEvents.RedisInstanceConnectionFailed,
        httpException,
        {
          databaseId: mockDatabase.id,
        },
      );
    });
  });
});
