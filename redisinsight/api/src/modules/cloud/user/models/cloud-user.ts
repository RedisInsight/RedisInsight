import { Expose, Type } from 'class-transformer';
import { CloudUserAccount } from 'src/modules/cloud/user/models/cloud-user-account';
import { TransformGroup } from 'src/common/constants';

export class CloudUser {
  @Expose()
  id?: number;

  @Expose()
  name?: string;

  @Expose()
  currentAccountId?: number;

  @Expose({ groups: [TransformGroup.Secure] })
  currentCApiAccessKey?: string;

  @Expose({ groups: [TransformGroup.Secure] })
  currentCApiKey?: string;

  @Type(() => CloudUserAccount)
  @Expose()
  accounts?: CloudUserAccount[] = [];

  @Expose()
  syncedAt?: Date;
}
