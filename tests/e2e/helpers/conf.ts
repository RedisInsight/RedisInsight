import { Chance } from 'chance';
const chance = new Chance();

// Urls for using in the tests
export const commonUrl = process.env.COMMON_URL || 'https://localhost:5000';

const uniqueId = chance.string({ length: 10 });

export const ossStandaloneConfig = {
    host: process.env.OSS_STANDALONE_HOST || 'oss-standalone',
    port: process.env.OSS_STANDALONE_PORT || '6379',
    databaseName: `${process.env.OSS_STANDALONE_DATABASE_NAME || 'test_standalone'}-${uniqueId}`,
    databaseUsername: process.env.OSS_STANDALONE_USERNAME,
    databasePassword: process.env.OSS_STANDALONE_PASSWORD
};

export const ossStandaloneV5Config = {
    host: process.env.OSS_STANDALONE_V5_HOST || 'oss-standalone-v5',
    port: process.env.OSS_STANDALONE_V5_PORT || '6379',
    databaseName: `${process.env.OSS_STANDALONE_V5_DATABASE_NAME || 'test_standalone-v5'}-${uniqueId}`,
    databaseUsername: process.env.OSS_STANDALONE_V5_USERNAME,
    databasePassword: process.env.OSS_STANDALONE_V5_PASSWORD
};

export const ossStandaloneRedisearch = {
    host: process.env.OSS_STANDALONE_REDISEARCH_HOST || 'oss-standalone-redisearch',
    port: process.env.OSS_STANDALONE_REDISEARCH_PORT || '6379',
    databaseName: `${process.env.OSS_STANDALONE_REDISEARCH_DATABASE_NAME || 'test_standalone-redisearch'}-${uniqueId}`,
    databaseUsername: process.env.OSS_STANDALONE_REDISEARCH_USERNAME,
    databasePassword: process.env.OSS_STANDALONE_REDISEARCH_PASSWORD
};

export const ossClusterConfig = {
    ossClusterHost: process.env.OSS_CLUSTER_HOST || 'oss-cluster',
    ossClusterPort: process.env.OSS_CLUSTER_PORT || '7000',
    ossClusterDatabaseName: `${process.env.OSS_CLUSTER_DATABASE_NAME || 'test_cluster'}-${uniqueId}`
};

export const ossSentinelConfig = {
    sentinelHost: process.env.OSS_SENTINEL_HOST || 'oss-sentinel',
    sentinelPort: process.env.OSS_SENTINEL_PORT || '26379',
    sentinelPassword: process.env.OSS_SENTINEL_PASSWORD || 'password'
};

export const redisEnterpriseClusterConfig = {
    host: process.env.RE_CLUSTER_HOST || 'redis-enterprise',
    port: process.env.RE_CLUSTER_PORT || '9443',
    databaseName: process.env.RE_CLUSTER_DATABASE_NAME || 'test-re-standalone',
    databaseUsername: process.env.RE_CLUSTER_ADMIN_USER || 'demo@redislabs.com',
    databasePassword: process.env.RE_CLUSTER_ADMIN_PASSWORD || '123456'
};

export const invalidOssStandaloneConfig = {
    host: 'oss-standalone-invalid',
    port: '1010',
    databaseName: `${process.env.OSS_STANDALONE_DATABASE_NAME || 'test_standalone-invalid'}-${uniqueId}`,
    databaseUsername: process.env.OSS_STANDALONE_USERNAME,
    databasePassword: process.env.OSS_STANDALONE_PASSWORD
};

export const ossStandaloneBigConfig = {
    host: process.env.OSS_STANDALONE_BIG_HOST || 'oss-standalone-big',
    port: process.env.OSS_STANDALONE_BIG_PORT || '6379',
    databaseName: `${process.env.OSS_STANDALONE_BIG_DATABASE_NAME || 'test_standalone_big'}-${uniqueId}`,
    databaseUsername: process.env.OSS_STANDALONE_BIG_USERNAME,
    databasePassword: process.env.OSS_STANDALONE_BIG_PASSWORD
};

export const cloudDatabaseConfig = {
    host: process.env.E2E_CLOUD_DATABASE_HOST || '',
    port: process.env.E2E_CLOUD_DATABASE_PORT || '',
    databaseName: `${process.env.E2E_CLOUD_DATABASE_NAME || 'cloud-database'}-${uniqueId}`,
    databaseUsername: process.env.E2E_CLOUD_DATABASE_USERNAME,
    databasePassword: process.env.E2E_CLOUD_DATABASE_PASSWORD
};

export const ossStandaloneNoPermissionsConfig = {
    host: process.env.OSS_STANDALONE_BIG_HOST || 'oss-standalone',
    port: process.env.OSS_STANDALONE_BIG_PORT || '6379',
    databaseName: `${process.env.OSS_STANDALONE_BIG_DATABASE_NAME || 'oss-standalone-no-permissions'}-${uniqueId}`,
    databaseUsername: process.env.OSS_STANDALONE_BIG_USERNAME || 'noperm',
    databasePassword: process.env.OSS_STANDALONE_BIG_PASSWORD
};
