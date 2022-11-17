import { Server } from 'src/modules/server/models/server';
import { ServerEntity } from 'src/modules/server/entities/server.entity';

export const mockServerId = 'a77b23c1-7816-4ea4-b61f-d37a0f805ser';

export const mockServer = Object.assign(new Server(), {
  id: mockServerId,
  createDateTime: new Date(),
});

export const mockServerEntity = Object.assign(new ServerEntity(), {
  id: mockServerId,
  createDateTime: mockServer.createDateTime,
});

export const mockServerRepository = jest.fn(() => ({
  exists: jest.fn().mockResolvedValue(true),
  getOrCreate: jest.fn().mockResolvedValue(mockServer),
}));
