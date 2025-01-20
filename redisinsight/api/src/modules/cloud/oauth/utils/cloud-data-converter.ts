import { get } from 'lodash';
import {
  CloudAccountInfo, ICloudCapiAccount,
} from 'src/modules/cloud/oauth/models';
import { plainToClass } from 'class-transformer';

export const parseCloudAccountCapiResponse = (account: ICloudCapiAccount): CloudAccountInfo => plainToClass(
  CloudAccountInfo,
  {
    accountId: account.id,
    accountName: account.name,
    ownerName: get(account, ['key', 'owner', 'name']),
    ownerEmail: get(account, ['key', 'owner', 'email']),
  },
);
