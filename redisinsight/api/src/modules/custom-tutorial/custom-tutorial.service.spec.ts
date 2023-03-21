import { Test, TestingModule } from '@nestjs/testing';
import {
  globalCustomTutorialManifest,
  mockCustomTutorial,
  mockCustomTutorialFsProvider,
  mockCustomTutorialId,
  mockCustomTutorialManifestManifest, mockCustomTutorialManifestManifest2,
  mockCustomTutorialManifestProvider,
  mockCustomTutorialRepository,
  MockType, mockUploadCustomTutorialDto, mockUploadCustomTutorialExternalLinkDto,
} from 'src/__mocks__';
import * as fs from 'fs-extra';
import { CustomTutorialFsProvider } from 'src/modules/custom-tutorial/providers/custom-tutorial.fs.provider';
import { BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CustomTutorialService } from 'src/modules/custom-tutorial/custom-tutorial.service';
import { CustomTutorialRepository } from 'src/modules/custom-tutorial/repositories/custom-tutorial.repository';
import {
  CustomTutorialManifestProvider,
} from 'src/modules/custom-tutorial/providers/custom-tutorial.manifest.provider';
import ERROR_MESSAGES from 'src/constants/error-messages';

jest.mock('fs-extra');
const mockedFs = fs as jest.Mocked<typeof fs>;

const mockedAdmZip = {
  extractAllTo: jest.fn(),
};
jest.mock('adm-zip', () => jest.fn().mockImplementation(() => mockedAdmZip));

describe('CustomTutorialService', () => {
  let service: CustomTutorialService;
  let customTutorialRepository: MockType<CustomTutorialRepository>;
  let customTutorialFsProvider: MockType<CustomTutorialFsProvider>;
  let customTutorialManifestProvider: MockType<CustomTutorialManifestProvider>;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.mock('fs-extra', () => mockedFs);
    jest.mock('adm-zip', () => jest.fn().mockImplementation(() => mockedAdmZip));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomTutorialService,
        {
          provide: CustomTutorialRepository,
          useFactory: mockCustomTutorialRepository,
        },
        {
          provide: CustomTutorialFsProvider,
          useFactory: mockCustomTutorialFsProvider,
        },
        {
          provide: CustomTutorialManifestProvider,
          useFactory: mockCustomTutorialManifestProvider,
        },
      ],
    }).compile();

    service = await module.get(CustomTutorialService);
    customTutorialRepository = await module.get(CustomTutorialRepository);
    customTutorialFsProvider = await module.get(CustomTutorialFsProvider);
    customTutorialManifestProvider = await module.get(CustomTutorialManifestProvider);
  });

  describe('determineTutorialName', () => {
    const entries = [
      'name.zip',
      'name',
      'https://some.com/name',
      'https://some.com/name?some=query&might=be&here',
      'https://some.com/name.zip',
      'https://some.com/name.zip?some=query&might=be&here',
      'file://some/folder/name',
      'file://some/folder/name.zip',
      '/some/unix/path/name',
      '/some/unix/path/name.zip',
      'C:\\\\Windows\\name',
      'C:\\\\Windows\\name.zip',
    ];

    it('Should generate proper tutorial name for all possible inputs', async () => {
      customTutorialManifestProvider.getManifestJson.mockResolvedValue(null);
      await Promise.all(entries.map(async (entry) => {
        expect({
          entry,
          name: await service['determineTutorialName']('/na', entry),
        }).toEqual({
          entry,
          name: 'name',
        });
      }));
    });
  });

  describe('create', () => {
    it('Should create custom tutorial from file', async () => {
      const result = await service.create(mockUploadCustomTutorialDto);

      expect(result).toEqual(mockCustomTutorialManifestManifest);
    });

    it('Should create custom tutorial from external url', async () => {
      const result = await service.create(mockUploadCustomTutorialExternalLinkDto);

      expect(result).toEqual(mockCustomTutorialManifestManifest);
    });

    it('Should throw BadRequestException in case when either link or file was not provided', async () => {
      try {
        await service.create({} as any);
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toEqual('File or external link should be provided');
      }
    });

    it('Should throw InternalServerError in case of any non-HttpException error', async () => {
      customTutorialRepository.create.mockRejectedValueOnce(new Error('Unable to create'));

      try {
        await service.create(mockUploadCustomTutorialDto);
      } catch (e) {
        expect(e).toBeInstanceOf(InternalServerErrorException);
        expect(e.message).toEqual('Unable to create');
      }
    });
  });

  describe('getGlobalManifest', () => {
    it('Should return global manifest with 2 tutorials', async () => {
      customTutorialManifestProvider.generateTutorialManifest
        .mockResolvedValueOnce(mockCustomTutorialManifestManifest)
        .mockResolvedValueOnce(mockCustomTutorialManifestManifest2);

      const result = await service.getGlobalManifest();

      expect(result).toEqual(globalCustomTutorialManifest);
    });

    it('Should return global manifest with 1 tutorials since 1 failed to fetch', async () => {
      customTutorialManifestProvider.generateTutorialManifest
        .mockResolvedValueOnce(null);

      const result = await service.getGlobalManifest();

      expect(result).toEqual([
        {
          ...globalCustomTutorialManifest[0],
          children: [
            mockCustomTutorialManifestManifest,
          ],
        },
      ]);
    });

    it('Should return global manifest without children in case of any error', async () => {
      customTutorialRepository.list.mockRejectedValueOnce(new Error('Unable to get list of tutorials'));

      const result = await service.getGlobalManifest();

      expect(result).toEqual([
        {
          ...globalCustomTutorialManifest[0],
          children: [],
        },
      ]);
    });
  });

  describe('delete', () => {
    it('Should successfully delete entity and remove related directory', async () => {
      await service.delete(mockCustomTutorialId);

      expect(customTutorialFsProvider.removeFolder).toHaveBeenCalledWith(mockCustomTutorial.absolutePath);
    });

    it('Should throw NotFound error when try to delete not existing tutorial', async () => {
      customTutorialRepository.get.mockResolvedValueOnce(null);

      try {
        await service.delete(mockCustomTutorialId);
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toEqual(ERROR_MESSAGES.CUSTOM_TUTORIAL_NOT_FOUND);
      }
    });

    it('Should throw InternalServerError in case of any non-HttpException error', async () => {
      customTutorialRepository.delete.mockRejectedValueOnce(new Error('Unable to delete'));

      try {
        await service.delete(mockCustomTutorialId);
      } catch (e) {
        expect(e).toBeInstanceOf(InternalServerErrorException);
        expect(e.message).toEqual('Unable to delete');
      }
    });
  });
});
