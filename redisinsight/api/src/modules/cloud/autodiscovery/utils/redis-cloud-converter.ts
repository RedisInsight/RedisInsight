import { RE_CLOUD_MODULES_NAMES } from 'src/constants';
import { get, find, isArray } from 'lodash';
import {
  CloudAccountInfo,
  CloudDatabase, CloudDatabaseMemoryStorage,
  CloudDatabasePersistencePolicy, CloudDatabaseProtocol,
  CloudSubscription, CloudSubscriptionType, ICloudApiDatabase,
} from 'src/modules/cloud/autodiscovery/models';
import { plainToClass } from 'class-transformer';

export function convertRECloudModuleName(name: string): string {
  return RE_CLOUD_MODULES_NAMES[name] ?? name;
}

export const parseCloudAccountResponse = (account: any): CloudAccountInfo => plainToClass(CloudAccountInfo, {
  accountId: account.id,
  accountName: account.name,
  ownerName: get(account, ['key', 'owner', 'name']),
  ownerEmail: get(account, ['key', 'owner', 'email']),
});

export const parseCloudSubscriptionsResponse = (
  subscriptions: any[],
  type: CloudSubscriptionType,
): CloudSubscription[] => {
  const result: CloudSubscription[] = [];
  if (subscriptions?.length) {
    subscriptions.forEach((subscription): void => {
      result.push(plainToClass(CloudSubscription, {
        id: subscription.id,
        type,
        name: subscription.name,
        numberOfDatabases: subscription.numberOfDatabases,
        status: subscription.status,
        provider: get(subscription, ['cloudDetails', 0, 'provider']),
        region: get(subscription, [
          'cloudDetails',
          0,
          'regions',
          0,
          'region',
        ]),
      }));
    });
  }
  return result;
};

export const parseCloudDatabaseResponse = (
  database: ICloudApiDatabase,
  subscriptionId: number,
  subscriptionType: CloudSubscriptionType,
): CloudDatabase => {
  const {
    databaseId, name, publicEndpoint, status, security, planMemoryLimit, memoryLimitMeasurementUnit,
  } = database;

  return plainToClass(CloudDatabase, {
    subscriptionId,
    subscriptionType,
    databaseId,
    name,
    publicEndpoint,
    status,
    password: security?.password,
    sslClientAuthentication: security.sslClientAuthentication,
    modules: database.modules
      .map((module) => convertRECloudModuleName(module.name)),
    options: {
      enabledDataPersistence:
        database.dataPersistence !== CloudDatabasePersistencePolicy.None,
      persistencePolicy: database.dataPersistence,
      enabledRedisFlash:
        database.memoryStorage === CloudDatabaseMemoryStorage.RamAndFlash,
      enabledReplication: database.replication,
      enabledBackup: !!database.periodicBackupPath,
      enabledClustering: database.clustering.numberOfShards > 1,
      isReplicaDestination: !!database.replicaOf,
    },
    cloudDetails: {
      cloudId: databaseId,
      subscriptionType,
      planMemoryLimit,
      memoryLimitMeasurementUnit,
    },
  }, { groups: ['security'] });
};

export const findReplicasForDatabase = (databases: any[], sourceDatabaseId: number): any[] => {
  const sourceDatabase = find(databases, {
    databaseId: sourceDatabaseId,
  });
  if (!sourceDatabase) {
    return [];
  }
  return databases.filter((replica): boolean => {
    const endpoints = get(replica, ['replicaOf', 'endpoints']);
    if (
      replica.databaseId === sourceDatabaseId
      || !endpoints
      || !endpoints.length
    ) {
      return false;
    }
    return endpoints.some((endpoint: string): boolean => (
      endpoint.includes(sourceDatabase.publicEndpoint)
        || endpoint.includes(sourceDatabase.privateEndpoint)
    ));
  });
};

export const parseCloudDatabasesInSubscriptionResponse = (
  response: any,
  subscriptionType: CloudSubscriptionType,
): CloudDatabase[] => {
  const subscription = isArray(response.subscription) ? response.subscription[0] : response.subscription;

  const { subscriptionId, databases } = subscription;

  let result: CloudDatabase[] = [];
  databases.forEach((database): void => {
    // We do not send the databases which have 'memcached' as their protocol.
    if (database.protocol === CloudDatabaseProtocol.Redis) {
      result.push(parseCloudDatabaseResponse(database, subscriptionId, subscriptionType));
    }
  });
  result = result.map((database) => ({
    ...database,
    subscriptionType,
    options: {
      ...database.options,
      isReplicaSource: !!findReplicasForDatabase(
        databases,
        database.databaseId,
      ).length,
    },
  }));
  return result;
};
