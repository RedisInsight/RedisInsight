import { Test, TestingModule } from '@nestjs/testing';
import {
  mockCustomTutorial,
  mockCustomTutorialManifestManifest, mockCustomTutorialManifestManifestJson,
} from 'src/__mocks__';
import { CustomTutorialManifestProvider } from 'src/modules/custom-tutorial/providers/custom-tutorial.manifest.provider';
import * as fs from 'fs-extra';

jest.mock('fs-extra');
const mockedFs = fs as jest.Mocked<typeof fs>;

describe('CustomTutorialManifestProvider', () => {
  let service: CustomTutorialManifestProvider;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.mock('fs-extra', () => mockedFs);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomTutorialManifestProvider,
      ],
    }).compile();

    service = await module.get(CustomTutorialManifestProvider);
  });

  describe('getManifest', () => {
    it('should successfully get manifest', async () => {
      mockedFs.readFile.mockResolvedValueOnce(Buffer.from(JSON.stringify(mockCustomTutorialManifestManifestJson)));

      const result = await service.getManifestJson(mockCustomTutorial.absolutePath);

      expect(result).toEqual(mockCustomTutorialManifestManifestJson);
    });

    it('should return null when no manifest found', async () => {
      mockedFs.readFile.mockRejectedValueOnce(new Error('No file'));

      const result = await service.getManifestJson(mockCustomTutorial.absolutePath);

      expect(result).toEqual(null);
    });
  });

  describe('generateTutorialManifest', () => {
    it('should successfully generate manifest', async () => {
      mockedFs.readFile.mockResolvedValueOnce(Buffer.from(JSON.stringify(mockCustomTutorialManifestManifestJson)));

      const result = await service.generateTutorialManifest(mockCustomTutorial);

      expect(result).toEqual(mockCustomTutorialManifestManifest);
    });

    it('should generate manifest without children', async () => {
      mockedFs.readFile.mockRejectedValueOnce(new Error('No file'));

      const result = await service.generateTutorialManifest(mockCustomTutorial);

      expect(result).toEqual({
        ...mockCustomTutorialManifestManifest,
        children: null,
      });
    });

    it('should return null in case of any error', async () => {
      const result = await service.generateTutorialManifest(null);

      expect(result).toEqual(null);
    });
  });
});
