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
  let mainCommandsProvider: MockType<CommandsJsonProvider>;
  let redisearchCommandsProvider: MockType<CommandsJsonProvider>;
  let redijsonCommandsProvider: MockType<CommandsJsonProvider>;
  let redistimeseriesCommandsProvider: MockType<CommandsJsonProvider>;
  let redisaiCommandsProvider: MockType<CommandsJsonProvider>;
  let redisgraphCommandsProvider: MockType<CommandsJsonProvider>;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommandsService,
        {
          provide: 'mainCommandsProvider',
          useFactory: mockCommandsJsonProvider,
        },
        {
          provide: 'redisearchCommandsProvider',
          useFactory: mockCommandsJsonProvider,
        },
        {
          provide: 'redijsonCommandsProvider',
          useFactory: mockCommandsJsonProvider,
        },
        {
          provide: 'redistimeseriesCommandsProvider',
          useFactory: mockCommandsJsonProvider,
        },
        {
          provide: 'redisaiCommandsProvider',
          useFactory: mockCommandsJsonProvider,
        },
        {
          provide: 'redisgraphCommandsProvider',
          useFactory: mockCommandsJsonProvider,
        },
      ],
    }).compile();

    service = module.get(CommandsService);
    mainCommandsProvider = module.get('mainCommandsProvider');
    redisearchCommandsProvider = module.get('redisearchCommandsProvider');
    redijsonCommandsProvider = module.get('redijsonCommandsProvider');
    redistimeseriesCommandsProvider = module.get('redistimeseriesCommandsProvider');
    redisaiCommandsProvider = module.get('redisaiCommandsProvider');
    redisgraphCommandsProvider = module.get('redisgraphCommandsProvider');

    mainCommandsProvider.getCommands.mockResolvedValue(mockMainCommands);
    redisearchCommandsProvider.getCommands.mockResolvedValue(mockRedisearchCommands);
    redijsonCommandsProvider.getCommands.mockResolvedValue(mockRedijsonCommands);
    redistimeseriesCommandsProvider.getCommands.mockResolvedValue(mockRedistimeseriesCommands);
    redisaiCommandsProvider.getCommands.mockResolvedValue(mockRedisaiCommands);
    redisgraphCommandsProvider.getCommands.mockResolvedValue(mockRedisgraphCommands);
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
