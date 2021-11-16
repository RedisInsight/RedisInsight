export interface IRedisCloudAccount {
  id: number;
  name: string;
  createdTimestamp: string;
  updatedTimestamp: string;
  key: IRedisCloudAccountKey;
}

interface IRedisCloudAccountKey {
  name: string;
  accountId: number;
  accountName: string;
  allowedSourceIps: string[];
  createdTimestamp: string;
  owner: IRedisCloudAccountOwner;
  httpSourceIp: string;
}

interface IRedisCloudAccountOwner {
  name: string;
  email: string;
}
