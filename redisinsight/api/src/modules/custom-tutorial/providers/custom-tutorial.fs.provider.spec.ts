import { Test, TestingModule } from '@nestjs/testing';
import {
  mockCustomTutorial, mockCustomTutorialTmpPath, mockCustomTutorialZipFile,
} from 'src/__mocks__';
import * as fs from 'fs-extra';
import { CustomTutorialFsProvider } from 'src/modules/custom-tutorial/providers/custom-tutorial.fs.provider';
import { InternalServerErrorException } from '@nestjs/common';

jest.mock('fs-extra');
const mockedFs = fs as jest.Mocked<typeof fs>;

const mockedAdmZip = {
  extractAllTo: jest.fn(),
};
jest.mock('adm-zip', () => jest.fn().mockImplementation(() => mockedAdmZip));

describe('CustomTutorialFsProvider', () => {
  let service: CustomTutorialFsProvider;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.mock('fs-extra', () => mockedFs);
    jest.mock('adm-zip', () => jest.fn().mockImplementation(() => mockedAdmZip));

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
      mockedFs.ensureDir.mockImplementationOnce(() => Promise.resolve());
      mockedFs.remove.mockImplementationOnce(() => Promise.resolve());
      prepareTmpFolderSpy = jest.spyOn(CustomTutorialFsProvider, 'prepareTmpFolder');
    });

    it('should unzip data', async () => {
      await service.unzipToTmpFolder(mockCustomTutorialZipFile);
    });
    it('should unzip data to particular tmp folder', async () => {
      prepareTmpFolderSpy.mockResolvedValueOnce(mockCustomTutorialTmpPath);

      await service.unzipToTmpFolder(mockCustomTutorialZipFile);

      expect(mockedAdmZip.extractAllTo).toHaveBeenCalledWith(mockCustomTutorialTmpPath, true);
    });

    it('should throw InternalServerError', async () => {
      mockedAdmZip.extractAllTo.mockRejectedValueOnce(new Error('Unable to extract file'));

      try {
        await service.unzipToTmpFolder(mockCustomTutorialZipFile);
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
      mockedFs.remove.mockRejectedValueOnce(new Error('No file'));

      await service.removeFolder(mockCustomTutorial.absolutePath);

      expect(mockedFs.remove).toHaveBeenCalledWith(mockCustomTutorial.absolutePath);
    });
  });
});
