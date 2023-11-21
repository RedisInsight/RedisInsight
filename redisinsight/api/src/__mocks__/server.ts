import { Server } from 'src/modules/server/models/server';
import { ServerEntity } from 'src/modules/server/entities/server.entity';
import { mockControlGroup, mockControlNumber } from 'src/__mocks__/feature';
import { EncryptionStrategy } from 'src/modules/encryption/models';
import config, { Config } from 'src/utils/config';
import { GetServerInfoResponse } from 'src/modules/server/dto/server.dto';

const SERVER_CONFIG = config.get('server') as Config['server'];

export const mockServerId = 'a77b23c1-7816-4ea4-b61f-d37a0f805ser';

export const mockServer = Object.assign(new Server(), {
  id: mockServerId,
  createDateTime: new Date(),
});

export const mockServerEntity = Object.assign(new ServerEntity(), {
  id: mockServerId,
  createDateTime: mockServer.createDateTime,
});

export const mockGetServerInfoResponse = Object.assign(new GetServerInfoResponse(), {
  ...mockServer,
  appVersion: SERVER_CONFIG.appVersion,
  osPlatform: process.platform,
  buildType: SERVER_CONFIG.buildType,
  appType: SERVER_CONFIG.buildType,
  controlGroup: mockControlGroup,
  controlNumber: mockControlNumber,
  encryptionStrategies: [
    EncryptionStrategy.PLAIN,
    EncryptionStrategy.KEYTAR,
  ],
});

export const mockServerRepository = jest.fn(() => ({
  exists: jest.fn().mockResolvedValue(true),
  getOrCreate: jest.fn().mockResolvedValue(mockServer),
}));

export const mockServerService = jest.fn(() => ({
  getInfo: jest.fn().mockResolvedValue(mockGetServerInfoResponse),
}));
