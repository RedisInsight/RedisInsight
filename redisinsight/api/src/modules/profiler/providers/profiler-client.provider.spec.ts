import { Test, TestingModule } from '@nestjs/testing';
import { LogFileProvider } from 'src/modules/profiler/providers/log-file.provider';
import {
  mockLogFile, mockLogFileProvider, mockMonitorSettings,
  mockSocket,
  MockType,
} from 'src/__mocks__';
import { ProfilerClientProvider } from 'src/modules/profiler/providers/profiler-client.provider';
import { InstancesBusinessService } from 'src/modules/shared/services/instances-business/instances-business.service';

describe('ProfilerClientProvider', () => {
  let service: ProfilerClientProvider;
  let logFileProvider: MockType<LogFileProvider>;
  let databaseService: MockType<InstancesBusinessService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfilerClientProvider,
        {
          provide: LogFileProvider,
          useFactory: () => mockLogFileProvider,
        },
        {
          provide: InstancesBusinessService,
          useFactory: () => ({
            connectToInstance: jest.fn(),
            getOneById: jest.fn(),
          }),
        },
      ],
    }).compile();

    service = await module.get(ProfilerClientProvider);
    logFileProvider = await module.get(LogFileProvider);
    databaseService = await module.get(InstancesBusinessService);

    logFileProvider.getOrCreate.mockReturnValue(mockLogFile);
    databaseService.getOneById.mockResolvedValue({ name: 'alias' });
  });

  it('getOrCreateClient', async () => {
    await service.getOrCreateClient(
      mockLogFile.instanceId,
      mockSocket,
      null,
    );

    expect(service['profilerClients'].size).toEqual(1);
    expect(databaseService.getOneById).not.toHaveBeenCalled();
    expect(logFileProvider.getOrCreate).not.toHaveBeenCalled();

    await service.getOrCreateClient(
      mockLogFile.instanceId,
      { ...mockSocket, id: '2' },
      mockMonitorSettings,
    );

    expect(service['profilerClients'].size).toEqual(2);
    expect(databaseService.getOneById).toHaveBeenCalled();
    expect(logFileProvider.getOrCreate).toHaveBeenCalled();
  });

  it('getClient', async () => {
    const profilerClient = await service.getOrCreateClient(
      mockLogFile.instanceId,
      mockSocket,
      null,
    );

    expect(await service.getClient(profilerClient.id)).toEqual(profilerClient);
  });
});
