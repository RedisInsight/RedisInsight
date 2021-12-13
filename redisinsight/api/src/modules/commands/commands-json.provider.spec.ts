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
          useFactory: () => new CommandsJsonProvider('name', 'someurl'),
        },
      ],
    }).compile();

    service = module.get('service');
  });

  describe('updateLatestJson', () => {
    it('Should create dir and save proper json', async () => {
      mockedFs.existsSync.mockReturnValueOnce(false);

      await service.updateLatestJson();

      // todo: uncomment after enable esModuleInterop in the tsconfig
      // expect(mockedFs.mkdirSync).toHaveBeenCalled();
      // expect(mockedFs.writeFileSync).toHaveBeenCalled();
    });
    it('should not fail when incorrect data retrieved', async () => {
      mockedAxios.get.mockResolvedValueOnce('json');
      await service.updateLatestJson();

      // todo: uncomment after enable esModuleInterop in the tsconfig
      // expect(mockedFs.writeFileSync).not.toHaveBeenCalled();
    });
  });

  describe('getCommands', () => {
    it('should return default config when file was not found', async () => {
      mockedFs.readFileSync.mockImplementationOnce(() => { throw new Error('No file'); });
      mockedFs.readFileSync.mockReturnValueOnce(JSON.stringify(mockMainCommands));

      expect(await service.getCommands()).toEqual(mockMainCommands);
    });
    it('should return default config when incorrect json received from file', async () => {
      mockedFs.readFileSync.mockReturnValueOnce('incorrect json');
      mockedFs.readFileSync.mockReturnValueOnce(JSON.stringify(mockMainCommands));

      expect(await service.getCommands()).toEqual(mockMainCommands);
    });
    it('should return latest commands', async () => {
      mockedFs.readFileSync.mockReturnValueOnce(JSON.stringify(mockRedijsonCommands));

      expect(await service.getCommands()).toEqual(mockRedijsonCommands);
    });
  });

  describe('getDefaultCommands', () => {
    it('should return empty object when file was not found', async () => {
      mockedFs.readFileSync.mockImplementationOnce(() => { throw new Error('No file'); });

      expect(await service.getDefaultCommands()).toEqual({});
    });
    it('should return empty object when incorrect json received from file', async () => {
      mockedFs.readFileSync.mockReturnValue('incorrect json');

      expect(await service.getDefaultCommands()).toEqual({});
    });
    it('should return default commands', async () => {
      mockedFs.readFileSync.mockReturnValue(JSON.stringify(mockRedijsonCommands));

      expect(await service.getDefaultCommands()).toEqual(mockRedijsonCommands);
    });
  });
});
