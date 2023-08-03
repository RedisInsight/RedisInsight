import { pick } from 'lodash';
import { Test, TestingModule } from '@nestjs/testing';
import axios from 'axios';
import {
  mockCapiUnauthorizedError,
  mockCloudCapiAuthDto,
  mockCloudCapiHeaders,
  mockCloudTaskInit,
  mockGetCloudSubscriptionDatabaseDto,
  mockCloudCapiDatabase,
  mockGetCloudSubscriptionDatabaseDtoFixed,
  mockCloudCapiDatabaseFixed,
  mockCreateFreeCloudDatabaseDto,
  mockCloudCapiSubscriptionDatabasesFixed, mockCloudCapiSubscriptionDatabases,
} from 'src/__mocks__';
import { CloudApiUnauthorizedException } from 'src/modules/cloud/common/exceptions';
import { CloudDatabaseCapiProvider } from 'src/modules/cloud/database/cloud-database.capi.provider';

const mockedAxios = axios as jest.Mocked<typeof axios>;
jest.mock('axios');
mockedAxios.create = jest.fn(() => mockedAxios);

describe('CloudDatabaseCapiProvider', () => {
  let service: CloudDatabaseCapiProvider;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CloudDatabaseCapiProvider,
      ],
    }).compile();

    service = module.get(CloudDatabaseCapiProvider);
  });

  describe('getDatabase', () => {
    it('successfully get flexible cloud database', async () => {
      const response = {
        status: 200,
        data: mockCloudCapiDatabase,
      };
      mockedAxios.get.mockResolvedValue(response);

      expect(await service.getDatabase(
        mockCloudCapiAuthDto,
        mockGetCloudSubscriptionDatabaseDto,
      )).toEqual(mockCloudCapiDatabase);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        `/subscriptions/${mockGetCloudSubscriptionDatabaseDto.subscriptionId}/databases/${mockGetCloudSubscriptionDatabaseDto.databaseId}`,
        mockCloudCapiHeaders,
      );
    });
    it('successfully get fixed cloud database', async () => {
      const response = {
        status: 200,
        data: mockCloudCapiDatabaseFixed,
      };
      mockedAxios.get.mockResolvedValue(response);

      expect(await service.getDatabase(
        mockCloudCapiAuthDto,
        mockGetCloudSubscriptionDatabaseDtoFixed,
      )).toEqual(mockCloudCapiDatabaseFixed);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        `/fixed/subscriptions/${mockGetCloudSubscriptionDatabaseDtoFixed.subscriptionId}/databases/${mockGetCloudSubscriptionDatabaseDtoFixed.databaseId}`,
        mockCloudCapiHeaders,
      );
    });
    it('throw CloudApiUnauthorizedException exception', async () => {
      mockedAxios.get.mockRejectedValue(mockCapiUnauthorizedError);

      await expect(service.getDatabase(
        mockCloudCapiAuthDto,
        mockGetCloudSubscriptionDatabaseDto,
      )).rejects.toThrow(
        CloudApiUnauthorizedException,
      );
    });
  });
  describe('getDatabases', () => {
    it('successfully get flexible cloud databases', async () => {
      const response = {
        status: 200,
        data: mockCloudCapiSubscriptionDatabases,
      };
      mockedAxios.get.mockResolvedValue(response);

      expect(await service.getDatabases(
        mockCloudCapiAuthDto,
        mockGetCloudSubscriptionDatabaseDto,
      )).toEqual(mockCloudCapiSubscriptionDatabases);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        `/subscriptions/${mockGetCloudSubscriptionDatabaseDto.subscriptionId}/databases`,
        mockCloudCapiHeaders,
      );
    });
    it('successfully get fixed cloud databases', async () => {
      const response = {
        status: 200,
        data: mockCloudCapiSubscriptionDatabasesFixed,
      };
      mockedAxios.get.mockResolvedValue(response);

      expect(await service.getDatabases(
        mockCloudCapiAuthDto,
        mockGetCloudSubscriptionDatabaseDtoFixed,
      )).toEqual(mockCloudCapiSubscriptionDatabasesFixed);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        `/fixed/subscriptions/${mockGetCloudSubscriptionDatabaseDtoFixed.subscriptionId}/databases`,
        mockCloudCapiHeaders,
      );
    });
    it('throw CloudApiUnauthorizedException exception', async () => {
      mockedAxios.get.mockRejectedValue(mockCapiUnauthorizedError);

      await expect(service.getDatabases(
        mockCloudCapiAuthDto,
        mockGetCloudSubscriptionDatabaseDto,
      )).rejects.toThrow(
        CloudApiUnauthorizedException,
      );
    });
  });
  describe('createFreeDatabase', () => {
    it('successfully create fixed cloud database', async () => {
      const response = {
        status: 200,
        data: mockCloudTaskInit,
      };
      mockedAxios.post.mockResolvedValue(response);

      expect(await service.createFreeDatabase(
        mockCloudCapiAuthDto,
        mockCreateFreeCloudDatabaseDto,
      )).toEqual(mockCloudTaskInit);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        `/fixed/subscriptions/${mockGetCloudSubscriptionDatabaseDto.subscriptionId}/databases`,
        pick(
          mockCreateFreeCloudDatabaseDto,
          ['name', 'protocol', 'replication', 'alerts', 'dataEvictionPolicy', 'dataPersistence', 'free'],
        ),
        mockCloudCapiHeaders,
      );
    });
    it('throw CloudApiUnauthorizedException exception', async () => {
      mockedAxios.post.mockRejectedValue(mockCapiUnauthorizedError);

      await expect(service.createFreeDatabase(
        mockCloudCapiAuthDto,
        mockCreateFreeCloudDatabaseDto,
      )).rejects.toThrow(
        CloudApiUnauthorizedException,
      );
    });
  });
});
