import { Chance } from 'chance';
const chance = new Chance();
// Urls for using in the tests
export const commonUrl = process.env.COMMON_URL || 'https://localhost:5000';

export const ossStandaloneConfig = {
    host: process.env.OSS_STANDALONE_HOST || 'oss-standalone',
    port: process.env.OSS_STANDALONE_PORT || '6379',
    databaseName: process.env.OSS_STANDALONE_DATABASE_NAME  + chance.string({ length: 10 }) || 'test_standalone' + chance.string({ length: 10 }),
    databaseUsername: process.env.OSS_STANDALONE_USERNAME,
    databasePassword: process.env.OSS_STANDALONE_PASSWORD
};

export const ossStandaloneV5Config = {
    host: process.env.OSS_STANDALONE_V5_HOST || 'oss-standalone-v5',
    port: process.env.OSS_STANDALONE_V5_PORT || '6379',
    databaseName: process.env.OSS_STANDALONE_V5_DATABASE_NAME  + chance.string({ length: 10 }) || 'test_standalone-v5'  + chance.string({ length: 10 }),
    databaseUsername: process.env.OSS_STANDALONE_V5_USERNAME,
    databasePassword: process.env.OSS_STANDALONE_V5_PASSWORD
};

export const ossStandaloneRedisearch = {
    host: process.env.OSS_STANDALONE_REDISEARCH_HOST || 'oss-standalone-redisearch',
    port: process.env.OSS_STANDALONE_REDISEARCH_PORT || '6379',
    databaseName: process.env.OSS_STANDALONE_REDISEARCH_DATABASE_NAME  + chance.string({ length: 10 }) || 'test_standalone-redisearch'  + chance.string({ length: 10 }),
    databaseUsername: process.env.OSS_STANDALONE_REDISEARCH_USERNAME,
    databasePassword: process.env.OSS_STANDALONE_REDISEARCH_PASSWORD
};

export const ossClusterConfig = {
    ossClusterHost: process.env.OSS_CLUSTER_HOST || 'oss-cluster',
    ossClusterPort: process.env.OSS_CLUSTER_PORT || '7000',
    ossClusterDatabaseName: process.env.OSS_CLUSTER_DATABASE_NAME  + chance.string({ length: 10 }) || 'test_cluster'  + chance.string({ length: 10 })
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
    host: process.env.OSS_STANDALONE_HOST || 'oss-standalone-invalid',
    port: process.env.OSS_STANDALONE_PORT || '1010',
    databaseName: process.env.OSS_STANDALONE_DATABASE_NAME  + chance.string({ length: 10 }) || 'test_standalone-invalid'  + chance.string({ length: 10 }),
    databaseUsername: process.env.OSS_STANDALONE_USERNAME,
    databasePassword: process.env.OSS_STANDALONE_PASSWORD
};
