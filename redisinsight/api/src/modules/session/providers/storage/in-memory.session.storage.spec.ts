import { TestingModule, Test } from '@nestjs/testing';
import {
  MockType,
} from 'src/__mocks__';
import { InMemorySessionStorage } from 'src/modules/session/providers/storage/in-memory.session.storage';
import { Session } from 'src/common/models';

const mockSessionUserData = {
  user: {
    userId: '1',
    uniqueId: '1',
  },
};

const mockSessionCloudData = {
  cloud: {
    accessToken: 'access token',
    user: {
      id: 'cloud_id_1',
      name: 'user name',
      accounts: [{
        id: 'cloud_account_id_1',
        name: 'cloud account 1',
        active: false,
      }, {
        id: 'cloud_account_id_2',
        name: 'cloud account 2',
        active: false,
      }],
    },
  },
};

const mockSession = Object.assign(new Session(), {
  id: '1',
  data: {
    ...mockSessionUserData,
  },
});

describe('ServerService', () => {
  let service: InMemorySessionStorage;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InMemorySessionStorage,
      ],
    }).compile();

    service = module.get(InMemorySessionStorage);
  });

  describe('createSession', () => {
    it('Should create new session if not exists', async () => {
      expect(service['sessions'].size).toEqual(0);

      const result = await service.createSession(mockSession);

      expect(result).toEqual(mockSession);
      expect(service['sessions'].size).toEqual(1);
      expect(service['sessions'].get(mockSession.id)).toEqual(mockSession);
    });
  });

  describe('updateSessionData', () => {
    it('Should not affect existing data', async () => {
      service['sessions'] = new Map([[mockSession.id, mockSession]]);

      const result = await service.updateSessionData(mockSession.id, {});

      expect(result).toEqual(mockSession);
    });
    it('Should add cloud data', async () => {
      service['sessions'] = new Map([[mockSession.id, mockSession]]);

      const result = await service.updateSessionData(mockSession.id, mockSessionCloudData);

      expect(result).toEqual({
        ...mockSession,
        data: {
          ...mockSession.data,
          ...mockSessionCloudData,
        },
      });
    });
    it('Should add update cloud data cloud data', async () => {
      service['sessions'] = new Map([[mockSession.id, mockSession]]);
    });
  });
});
