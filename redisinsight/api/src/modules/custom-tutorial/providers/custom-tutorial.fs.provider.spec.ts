import { Test, TestingModule } from '@nestjs/testing';
import {
  mockCustomTutorial,
  mockCustomTutorialAdmZipEntry,
  mockCustomTutorialMacosxAdmZipEntry, mockCustomTutorialsHttpLink,
  mockCustomTutorialTmpPath,
  mockCustomTutorialZipFile, mockCustomTutorialZipFileAxiosResponse,
} from 'src/__mocks__';
import * as fs from 'fs-extra';
import axios from 'axios';
import { CustomTutorialFsProvider } from 'src/modules/custom-tutorial/providers/custom-tutorial.fs.provider';
import { InternalServerErrorException } from '@nestjs/common';
import AdmZip from 'adm-zip';
import ERROR_MESSAGES from 'src/constants/error-messages';
import config from 'src/utils/config';

const PATH_CONFIG = config.get('dir_path');

jest.mock('fs-extra');
const mockedFs = fs as jest.Mocked<typeof fs>;

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockedAdmZip = {
  extractAllTo: jest.fn(),
  getEntries: jest.fn(),
  extractEntryTo: jest.fn(),
} as unknown as jest.Mocked<AdmZip>;

jest.mock('adm-zip', () => jest.fn().mockImplementation(() => mockedAdmZip));

describe('CustomTutorialFsProvider', () => {
  let service: CustomTutorialFsProvider;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.mock('fs-extra', () => mockedFs);
    jest.mock('adm-zip', () => jest.fn().mockImplementation(() => mockedAdmZip));
    jest.mock('axios', () => mockedAxios);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomTutorialFsProvider,
      ],
    }).compile();

    service = await module.get(CustomTutorialFsProvider);
  });

  describe('unzipToTmpFolder', () => {
    let prepareTmpFolderSpy;

    beforeEach(() => {
      mockedAxios.get.mockResolvedValueOnce(mockCustomTutorialZipFileAxiosResponse);
      mockedAdmZip.getEntries.mockReturnValue([]);
      mockedFs.ensureDir.mockImplementationOnce(() => Promise.resolve());
      mockedFs.remove.mockImplementationOnce(() => Promise.resolve());
      prepareTmpFolderSpy = jest.spyOn(CustomTutorialFsProvider, 'prepareTmpFolder');
      prepareTmpFolderSpy.mockResolvedValueOnce(mockCustomTutorialTmpPath);
    });

    describe('unzipFromMemoryStoredFile', () => {
      it('should unzip data', async () => {
        const result = await service.unzipFromMemoryStoredFile(mockCustomTutorialZipFile);
        expect(result).toEqual(mockCustomTutorialTmpPath);
      });
      it('should unzip data into just generated tmp folder', async () => {
        prepareTmpFolderSpy.mockRestore();
        const result = await service.unzipFromMemoryStoredFile(mockCustomTutorialZipFile);
        expect(result).toContain(`${PATH_CONFIG.tmpDir}/RedisInsight-v2/custom-tutorials`);
      });
    });

    describe('unzipFromExternalLink', () => {
      it('should unzip data from external link', async () => {
        const result = await service.unzipFromExternalLink(mockCustomTutorialsHttpLink);
        expect(result).toEqual(mockCustomTutorialTmpPath);
      });

      it('should throw InternalServerError when 4incorrect external link provided', async () => {
        const responsePayload = {
          response: {
            status: 404,
            data: { message: 'resource not found' },
          },
        };

        mockedAxios.get.mockReset().mockRejectedValueOnce(responsePayload);

        try {
          await service.unzipFromExternalLink(mockCustomTutorialsHttpLink);
          fail();
        } catch (e) {
          expect(e).toBeInstanceOf(InternalServerErrorException);
          expect(e.message).toEqual(ERROR_MESSAGES.CUSTOM_TUTORIAL_UNABLE_TO_FETCH_FROM_EXTERNAL);
        }
      });
    });

    it('should unzip data to particular tmp folder', async () => {
      mockedAdmZip.getEntries.mockReturnValueOnce([
        mockCustomTutorialAdmZipEntry,
        mockCustomTutorialMacosxAdmZipEntry,
      ]);

      const result = await service.unzipToTmpFolder(mockedAdmZip);

      expect(result).toEqual(mockCustomTutorialTmpPath);
      expect(mockedAdmZip.extractEntryTo).toHaveBeenCalledTimes(1);
      expect(mockedAdmZip.extractEntryTo).toHaveBeenCalledWith(
        mockCustomTutorialAdmZipEntry,
        mockCustomTutorialTmpPath,
        true,
        true,
        false,
      );
    });

    it('should throw InternalServerError', async () => {
      mockedAdmZip.getEntries.mockReturnValueOnce([
        mockCustomTutorialAdmZipEntry,
        mockCustomTutorialMacosxAdmZipEntry,
      ]);
      mockedAdmZip.extractEntryTo.mockImplementationOnce(() => { throw new Error('Unable to extract file'); });

      try {
        await service.unzipToTmpFolder(mockedAdmZip);
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(InternalServerErrorException);
        expect(e.message).toEqual('Unable to extract file');
      }
    });
  });

  describe('moveFolder', () => {
    it('should move folder', async () => {
      mockedFs.move.mockImplementationOnce(() => Promise.resolve());

      await service.moveFolder(
        mockCustomTutorialTmpPath,
        mockCustomTutorial.absolutePath,
      );

      expect(mockedFs.pathExists).not.toHaveBeenCalled();
      expect(mockedFs.remove).not.toHaveBeenCalled();
      expect(mockedFs.move).toHaveBeenCalledWith(
        mockCustomTutorialTmpPath,
        mockCustomTutorial.absolutePath,
      );
    });

    it('should move folder when there is no such folder in the dest path', async () => {
      mockedFs.pathExists.mockImplementationOnce(() => Promise.resolve(false));
      mockedFs.move.mockImplementationOnce(() => Promise.resolve());

      await service.moveFolder(
        mockCustomTutorialTmpPath,
        mockCustomTutorial.absolutePath,
        true,
      );

      expect(mockedFs.pathExists).toHaveBeenCalledWith(mockCustomTutorial.absolutePath);
      expect(mockedFs.remove).not.toHaveBeenCalled();
      expect(mockedFs.move).toHaveBeenCalledWith(
        mockCustomTutorialTmpPath,
        mockCustomTutorial.absolutePath,
      );
    });

    it('should move folder when and remove existing one before', async () => {
      mockedFs.pathExists.mockImplementationOnce(() => Promise.resolve(true));
      mockedFs.remove.mockImplementationOnce(() => Promise.resolve());
      mockedFs.move.mockImplementationOnce(() => Promise.resolve());

      await service.moveFolder(
        mockCustomTutorialTmpPath,
        mockCustomTutorial.absolutePath,
        true,
      );

      expect(mockedFs.pathExists).toHaveBeenCalledWith(mockCustomTutorial.absolutePath);
      expect(mockedFs.remove).toHaveBeenCalledWith(mockCustomTutorial.absolutePath);
      expect(mockedFs.move).toHaveBeenCalledWith(
        mockCustomTutorialTmpPath,
        mockCustomTutorial.absolutePath,
      );
    });

    it('should throw InternalServerError', async () => {
      mockedFs.pathExists.mockImplementationOnce(() => Promise.resolve(true));
      mockedFs.remove.mockImplementationOnce(() => Promise.resolve());
      mockedFs.move.mockImplementationOnce(() => Promise.reject(new Error('dest folder exists')));

      try {
        await service.moveFolder(
          mockCustomTutorialTmpPath,
          mockCustomTutorial.absolutePath,
          true,
        );
      } catch (e) {
        expect(e).toBeInstanceOf(InternalServerErrorException);
        expect(e.message).toEqual('dest folder exists');
      }
    });
  });

  describe('removeFolder', () => {
    it('should remove folder', async () => {
      mockedFs.remove.mockResolvedValueOnce();

      await service.removeFolder(mockCustomTutorial.absolutePath);

      expect(mockedFs.remove).toHaveBeenCalledWith(mockCustomTutorial.absolutePath);
    });

    it('should not fail in case of any error', async () => {
      mockedFs.remove.mockReset().mockRejectedValueOnce(new Error('No file'));

      await service.removeFolder(mockCustomTutorial.absolutePath);

      expect(mockedFs.remove).toHaveBeenCalledWith(mockCustomTutorial.absolutePath);
    });
  });
});
