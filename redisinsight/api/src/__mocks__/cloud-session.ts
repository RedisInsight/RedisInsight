import { mockCloudApiAuthDto } from 'src/__mocks__/cloud-user';

export const mockCloudSession = {
  ...mockCloudApiAuthDto,
  user: {
    id: 'cloud_id_1',
    name: 'user name',
    accounts: [{
      id: 'cloud_account_id_1',
      name: 'cloud account 1',
      active: false,
    }, {
      id: 'cloud_account_id_2',
      name: 'cloud account 2',
      active: false,
    }],
  },
};

export const mockCloudSessionService = jest.fn(() => ({
  getSession: jest.fn().mockResolvedValue(mockCloudSession),
  updateSessionData: jest.fn().mockResolvedValue(mockCloudSession),
  deleteSessionData: jest.fn(),
  invalidateApiSession: jest.fn().mockResolvedValue(undefined),
}));
