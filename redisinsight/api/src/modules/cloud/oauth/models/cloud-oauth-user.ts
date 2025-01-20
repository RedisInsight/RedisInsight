import { Expose, Type } from 'class-transformer';
import { CloudUserAccount } from 'src/modules/cloud/oauth/models/cloud-user-account';
import { TransformGroup } from 'src/common/constants';
import { CloudCapiKey } from 'src/modules/cloud/capi-key/model';

export class CloudOauthUser {
  @Expose()
  id?: number;

  @Expose()
  name?: string;

  @Expose()
  currentAccountId?: number;

  @Type(() => CloudCapiKey)
  @Expose({ groups: [TransformGroup.Secure] })
  capiKey?: CloudCapiKey;

  @Type(() => CloudUserAccount)
  @Expose()
  accounts?: CloudUserAccount[] = [];
}
