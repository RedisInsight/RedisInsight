import { IP_ADDRESS_REGEX, PRIVATE_IP_ADDRESS_REGEX } from 'src/constants';
import { HostingProvider } from 'src/modules/database/entities/database.entity';
import { RedisClient } from 'src/modules/redis/client';

// Because we do not bind potentially dangerous logic to this.
// We define a hosting provider for telemetry only.
export const getHostingProvider = async (client: RedisClient, databaseHost: string): Promise<HostingProvider> => {
  try {
    const host = databaseHost.toLowerCase();

    // Tries to detect the hosting provider from the hostname.
    if (host.endsWith('rlrcp.com') || host.endsWith('redislabs.com') || host.endsWith('redis-cloud.com')) {
      return HostingProvider.RE_CLOUD;
    }
    if (host.endsWith('cache.amazonaws.com')) {
      return HostingProvider.AWS_ELASTICACHE;
    }
    if (host.includes('memorydb')) {
      return HostingProvider.AWS_MEMORYDB;
    }
    if (host.endsWith('cache.windows.net')) {
      return HostingProvider.AZURE_CACHE;
    }
    if (host.endsWith('redisenterprise.cache.azure.net')) {
      return HostingProvider.AZURE_CACHE_REDIS_ENTERPRISE;
    }

    try {
      const hello = JSON.stringify(await client.sendCommand(
        ['hello'],
        { replyEncoding: 'utf8' },
      ) as string[]).toLowerCase();

      if (hello.includes('/enterprise-managed')) {
        return HostingProvider.REDIS_ENTERPRISE;
      }

      if (hello.includes('google')) {
        return HostingProvider.MEMORYSTORE;
      }
    } catch (e) {
      // ignore errors
    }

    try {
      const info = (await client.sendCommand(
        ['info'],
        { replyEncoding: 'utf8' },
      ) as string).toLowerCase();

      if (info.includes('elasticache')) {
        return HostingProvider.AWS_ELASTICACHE;
      }

      if (info.includes('memorydb')) {
        return HostingProvider.AWS_MEMORYDB;
      }

      if (info.includes('keydb')) {
        return HostingProvider.KEYDB;
      }

      if (info.includes('valkey')) {
        return HostingProvider.VALKEY;
      }

      if (info.includes('dragonfly_version')) {
        return HostingProvider.DRAGONFLY;
      }

      if (info.includes('garnet_version')) {
        return HostingProvider.GARNET;
      }

      if (info.includes('kvrocks_version')) {
        return HostingProvider.KVROCKS;
      }

      if (info.includes('redict_version')) {
        return HostingProvider.REDICT;
      }

      if (info.includes('upstash_version')) {
        return HostingProvider.UPSTASH;
      }

      if (info.includes('executable:/opt/redis/bin/redis-server')) {
        return HostingProvider.REDIS_COMMUNITY_EDITION;
      }

      if (info.includes('executable:/opt/redis-stack/bin/redis-server')) {
        return HostingProvider.REDIS_STACK;
      }
    } catch (e) {
      // ignore error
    }

    if (host === '0.0.0.0' || host === 'localhost' || host === '127.0.0.1') {
      return HostingProvider.UKNOWN_LOCALHOST;
    }

    // todo: investigate weather we need this
    if (IP_ADDRESS_REGEX.test(host) && PRIVATE_IP_ADDRESS_REGEX.test(host)) {
      return HostingProvider.UKNOWN_LOCALHOST;
    }
  } catch (e) {
    // ignore any error
  }

  return HostingProvider.UNKNOWN;
};
