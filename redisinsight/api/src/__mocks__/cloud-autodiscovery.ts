import { ActionStatus } from 'src/common/models';
import { ImportCloudDatabaseDto, ImportCloudDatabaseResponse } from 'src/modules/cloud/autodiscovery/dto';
import {
  mockCloudDatabase,
  mockCloudDatabaseFixed,
  mockGetCloudSubscriptionDatabaseDto,
} from 'src/__mocks__/cloud-database';
import { CloudSubscriptionType } from 'src/modules/cloud/subscription/models';

export const mockImportCloudDatabaseDto = Object.assign(new ImportCloudDatabaseDto(), {
  ...mockGetCloudSubscriptionDatabaseDto,
});

export const mockImportCloudDatabaseDtoFixed = Object.assign(new ImportCloudDatabaseDto(), {
  ...mockGetCloudSubscriptionDatabaseDto,
  subscriptionType: CloudSubscriptionType.Fixed,
});

export const mockImportCloudDatabaseResponse = Object.assign(new ImportCloudDatabaseResponse(), {
  ...mockImportCloudDatabaseDto,
  status: ActionStatus.Success,
  message: 'Added',
  databaseDetails: mockCloudDatabase,
});

export const mockImportCloudDatabaseResponseFixed = Object.assign(new ImportCloudDatabaseResponse(), {
  ...mockImportCloudDatabaseDtoFixed,
  status: ActionStatus.Success,
  message: 'Added',
  databaseDetails: mockCloudDatabaseFixed,
});

export const mockCloudAutodiscoveryAnalytics = jest.fn(() => ({
  sendGetRECloudSubsSucceedEvent: jest.fn(),
  sendGetRECloudSubsFailedEvent: jest.fn(),
  sendGetRECloudDbsSucceedEvent: jest.fn(),
  sendGetRECloudDbsFailedEvent: jest.fn(),
}));
