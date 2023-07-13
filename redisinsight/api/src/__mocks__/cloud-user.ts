import { CloudAccountInfo, ICloudCapiAccount } from 'src/modules/cloud/user/models';
import { CloudCapiAuthDto } from 'src/modules/cloud/common/dto';

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

export const mockCloudCapiAuthDto: CloudCapiAuthDto = {
  capiKey: 'api_key',
  capiSecret: 'api_secret_key',
};
