import {
  CloudAccountInfo,
  CloudUser,
  CloudUserAccount,
  ICloudApiAccount, ICloudApiCapiAccessKey,
  ICloudApiCapiKey,
  ICloudApiCsrfToken,
  ICloudApiUser,
  ICloudCapiAccount
} from 'src/modules/cloud/user/models';
import { CloudCapiAuthDto } from 'src/modules/cloud/common/dto';
import { ICloudApiCredentials } from 'src/modules/cloud/common/models';

// ======================================= CAPI =======================================
export const mockCloudCapiAccount: ICloudCapiAccount = {
  id: 40131,
  name: 'Redis Labs',
  createdTimestamp: '2018-12-23T15:15:31Z',
  updatedTimestamp: '2020-06-03T13:16:59Z',
  key: {
    name: 'QA-HashedIn-Test-API-Key-2',
    accountId: 40131,
    accountName: 'Redis Labs',
    allowedSourceIps: ['0.0.0.0/0'],
    createdTimestamp: '2020-04-06T09:22:38Z',
    owner: {
      name: 'Cloud Account',
      email: 'cloud.account@redislabs.com',
    },
    httpSourceIp: '198.141.36.229',
  },
};

export const mockCloudAccountInfo = Object.assign(new CloudAccountInfo(), {
  accountId: mockCloudCapiAccount.id,
  accountName: mockCloudCapiAccount.name,
  ownerEmail: mockCloudCapiAccount.key.owner.email,
  ownerName: mockCloudCapiAccount.key.owner.name,
});

export const mockCloudUserCapiProvider = jest.fn(() => ({
  getCurrentAccount: jest.fn().mockResolvedValue(mockCloudCapiAccount),
}));

export const mockCloudUserCapiService = jest.fn(() => ({
  getCurrentAccount: jest.fn().mockResolvedValue(mockCloudAccountInfo),
}));

// ======================================= API =======================================
export const mockCloudCapiAuthDto: CloudCapiAuthDto = {
  capiKey: 'capi_key',
  capiSecret: 'capi_secret_key',
};

export const mockCloudApiCapiAccessKey: ICloudApiCapiAccessKey = {
  accessKey: mockCloudCapiAuthDto.capiKey,
};

export const mockCloudApiCsrfToken: ICloudApiCsrfToken = {
  csrf_token: 'csrf_p6vA6A5tF36Jf6twH2cBOqtt7n',
};

export const mockCloudApiAuthDto: ICloudApiCredentials = {
  accessToken: 'at_p6vA6A5tF36Jf6twH2cBOqtt7n',
  csrf: mockCloudApiCsrfToken.csrf_token,
  apiSessionId: 'asid_p6vA6A5tF36Jf6twH2cBOqtt7n',
};

export const mockCloudUserAccount = Object.assign(new CloudUserAccount(), {
  id: mockCloudCapiAccount.id,
  name: mockCloudCapiAccount.name,
  capiKey: mockCloudCapiAuthDto.capiKey,
  capiSecret: mockCloudCapiAuthDto.capiSecret,
});

export const mockCloudApiCapiKey: ICloudApiCapiKey = {
  id: 3001,
  name: 'capi-key-name',
  user_account: mockCloudUserAccount.id,
  secret_key: mockCloudCapiAuthDto.capiSecret,
};

export const mockCloudApiHeaders = {
  headers: {
    authorization: `Bearer ${mockCloudApiAuthDto.accessToken}`,
    'x-csrf-token': mockCloudApiAuthDto.csrf,
    cookie: `JSESSIONID=${mockCloudApiAuthDto.apiSessionId}`,
  },
};

export const mockCloudApiUser: ICloudApiUser = {
  id: 'api_user_id-1',
  current_account_id: `${mockCloudCapiAccount.id}`,
  name: 'User 1',
  email: 'user1@mail.com',
  user_id: 10001,
  role: 'owner',
};

export const mockCloudUser = Object.assign(new CloudUser(), {
  id: 'api_user_id-1',
  name: mockCloudApiUser.name,
  currentAccountId: mockCloudApiUser.current_account_id,
  // capiKey?: string
  // capiSecret?: string;
  // accounts?: CloudUserAccount[] = [];
  // syncedAt?: Date;
});

export const mockCloudApiAccount: ICloudApiAccount = {
  id: mockCloudCapiAccount.id,
  name: mockCloudCapiAccount.name,
  api_access_key: mockCloudApiCapiAccessKey.accessKey,
};

export const mockCloudUserApiProvider = jest.fn(() => ({
  getCurrentAccount: jest.fn().mockResolvedValue(mockCloudCapiAccount),
}));

export const mockCloudUserRepository = jest.fn(() => ({
  get: jest.fn().mockResolvedValue(mockCloudUser),
  update: jest.fn().mockResolvedValue(mockCloudUser),
}));
