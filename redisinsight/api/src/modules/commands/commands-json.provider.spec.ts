import axios from 'axios';
import * as fs from 'fs';
import { Test, TestingModule } from '@nestjs/testing';
import {
  mockMainCommands,
  mockRedijsonCommands,
} from 'src/__mocks__';
import { CommandsJsonProvider } from 'src/modules/commands/commands-json.provider';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock('fs');
const mockedFs = fs as jest.Mocked<typeof fs>;

describe('CommandsJsonProvider', () => {
  let service: CommandsJsonProvider;
  let updateLatestJsonSpy;

  beforeEach(async () => {
    jest.mock('fs', () => mockedFs);

    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.mkdirSync.mockReturnValue('');
    mockedFs.writeFileSync.mockReturnValue(undefined);
    mockedAxios.get.mockResolvedValue({ data: JSON.stringify(mockMainCommands) });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: 'service',
          useFactory: () => new CommandsJsonProvider('name', 'someurl', mockMainCommands),
        },
      ],
    }).compile();

    service = module.get('service');
    updateLatestJsonSpy = jest.spyOn<any, any>(service, 'updateLatestJson');
  });

  describe('onModuleInit', () => {
    it('should trigger updateLatestJson function', async () => {
      await service.onModuleInit();

      expect(updateLatestJsonSpy).toHaveBeenCalled();
    });
  });

  describe('updateLatestJson', () => {
    it('Should create dir and save proper json', async () => {
      mockedFs.existsSync.mockReturnValueOnce(false);

      await service.onModuleInit();

      // todo: uncomment after enable esModuleInterop in the tsconfig
      // expect(mockedFs.mkdirSync).toHaveBeenCalled();
      // expect(mockedFs.writeFileSync).toHaveBeenCalled();
    });
    it('should not fail when incorrect data retrieved', async () => {
      mockedAxios.get.mockResolvedValueOnce('incorrect json');
      await service.onModuleInit();

      // todo: uncomment after enable esModuleInterop in the tsconfig
      // expect(mockedFs.writeFileSync).not.toHaveBeenCalled();
    });
  });

  describe('getCommands', () => {
    it('should return default config when file was not found', async () => {
      mockedFs.readFileSync.mockImplementationOnce(() => { throw new Error('No file'); });

      expect(await service.getCommands()).toEqual(mockMainCommands);
    });
    it('should return default config when incorrect json received from file', async () => {
      mockedFs.readFileSync.mockReturnValue('incorrect json');

      expect(await service.getCommands()).toEqual(mockMainCommands);
    });
    it('should return latest commands', async () => {
      mockedFs.readFileSync.mockReturnValue(JSON.stringify(mockRedijsonCommands));

      expect(await service.getCommands()).toEqual(mockRedijsonCommands);
    });
  });
});
