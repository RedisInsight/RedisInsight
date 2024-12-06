import { Test, TestingModule } from '@nestjs/testing';
import {
  mockCloudCapiAuthDto,
  MockType,
  mockCloudTaskCapiProvider,
  mockCloudTaskInit,
  mockLoggerService,
} from 'src/__mocks__';
import { CloudApiUnauthorizedException } from 'src/modules/cloud/common/exceptions';
import { CloudTaskNotFoundException } from 'src/modules/cloud/job/exceptions';
import { CloudTaskCapiProvider } from 'src/modules/cloud/task/providers/cloud-task.capi.provider';
import { LoggerService } from 'src/modules/logger/logger.service';
import { CloudTaskCapiService } from './cloud-task.capi.service';

describe('CloudTaskCapiService', () => {
  let service: CloudTaskCapiService;
  let cloudTaskCapiProvider: MockType<CloudTaskCapiProvider>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CloudTaskCapiService,
        {
          provide: LoggerService,
          useValue: mockLoggerService,
        },
        {
          provide: CloudTaskCapiProvider,
          useFactory: mockCloudTaskCapiProvider,
        },
      ],
    }).compile();

    service = module.get(CloudTaskCapiService);
    cloudTaskCapiProvider = module.get(CloudTaskCapiProvider);
  });

  describe('getTask', () => {
    it('successfully get task', async () => {
      expect(await service.getTask(mockCloudCapiAuthDto, 'id')).toEqual(mockCloudTaskInit);
    });
    it('should throw CloudApiUnauthorizedException exception', async () => {
      cloudTaskCapiProvider.getTask.mockRejectedValueOnce(new CloudApiUnauthorizedException());
      await expect(service.getTask(mockCloudCapiAuthDto, 'id')).rejects.toThrow(
        CloudApiUnauthorizedException,
      );
    });
    it('should throw CloudTaskNotFoundException exception', async () => {
      cloudTaskCapiProvider.getTask.mockReturnValue(null);
      await expect(service.getTask(mockCloudCapiAuthDto, 'id')).rejects.toThrow(
        CloudTaskNotFoundException,
      );
    });
  });
});
