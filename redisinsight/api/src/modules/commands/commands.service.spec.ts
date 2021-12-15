import { Test, TestingModule } from '@nestjs/testing';
import { CommandsService } from 'src/modules/commands/commands.service';
import {
  mockCommandsJsonProvider,
  mockMainCommands,
  mockRedijsonCommands,
  mockRedisaiCommands,
  mockRedisearchCommands,
  mockRedisgraphCommands,
  mockRedistimeseriesCommands,
  MockType,
} from 'src/__mocks__';
import { CommandsJsonProvider } from 'src/modules/commands/commands-json.provider';

describe('CommandsService', () => {
  let service: CommandsService;

  const mainCommandsProvider: MockType<CommandsJsonProvider> = mockCommandsJsonProvider();
  const redisearchCommandsProvider: MockType<CommandsJsonProvider> = mockCommandsJsonProvider();
  const redijsonCommandsProvider: MockType<CommandsJsonProvider> = mockCommandsJsonProvider();
  const redistimeseriesCommandsProvider: MockType<CommandsJsonProvider> = mockCommandsJsonProvider();
  const redisaiCommandsProvider: MockType<CommandsJsonProvider> = mockCommandsJsonProvider();
  const redisgraphCommandsProvider: MockType<CommandsJsonProvider> = mockCommandsJsonProvider();

  beforeEach(async () => {
    jest.clearAllMocks();

    const commandsProviders = [
      mainCommandsProvider,
      redisearchCommandsProvider,
      redijsonCommandsProvider,
      redistimeseriesCommandsProvider,
      redisaiCommandsProvider,
      redisgraphCommandsProvider,
    ];

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: CommandsService,
          // @ts-ignore
          useFactory: () => new CommandsService(commandsProviders),
        },
      ],
    }).compile();

    service = module.get(CommandsService);

    mainCommandsProvider.getCommands.mockResolvedValue(mockMainCommands);
    redisearchCommandsProvider.getCommands.mockResolvedValue(mockRedisearchCommands);
    redijsonCommandsProvider.getCommands.mockResolvedValue(mockRedijsonCommands);
    redistimeseriesCommandsProvider.getCommands.mockResolvedValue(mockRedistimeseriesCommands);
    redisaiCommandsProvider.getCommands.mockResolvedValue(mockRedisaiCommands);
    redisgraphCommandsProvider.getCommands.mockResolvedValue(mockRedisgraphCommands);
  });

  describe('onModuleInit', () => {
    it('should trigger updateLatestJson function', async () => {
      await service.onModuleInit();

      expect(mainCommandsProvider.updateLatestJson).toHaveBeenCalled();
      expect(redisearchCommandsProvider.updateLatestJson).toHaveBeenCalled();
      expect(redijsonCommandsProvider.updateLatestJson).toHaveBeenCalled();
      expect(redistimeseriesCommandsProvider.updateLatestJson).toHaveBeenCalled();
      expect(redisaiCommandsProvider.updateLatestJson).toHaveBeenCalled();
      expect(redisgraphCommandsProvider.updateLatestJson).toHaveBeenCalled();
    });
  });

  describe('getAll', () => {
    it('Should return merged commands into one', async () => {
      expect(await service.getAll()).toEqual({
        ...mockRedisearchCommands,
        ...mockRedijsonCommands,
        ...mockRedistimeseriesCommands,
        ...mockRedisaiCommands,
        ...mockRedisgraphCommands,
        ...mockMainCommands,
      });
    });
  });
});
