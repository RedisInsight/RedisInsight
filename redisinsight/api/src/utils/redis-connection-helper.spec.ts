import * as IORedis from 'ioredis';
import * as Redis from 'ioredis-mock';
import { CONNECTION_NAME_GLOBAL_PREFIX } from 'src/constants';
import {
  generateRedisConnectionName,
  getConnectionName,
  getConnectionNamespace,
} from './redis-connection-helper';

const CLIENT_ID = '235e72f4-601f-4d01-8399-b5c51b617dc4';

const mockOptions = {
  host: 'localhost',
  port: 6379,
  connectionName: `${CONNECTION_NAME_GLOBAL_PREFIX}-common-235e72f4`,
};

const mockClient = new Redis('redis://localhost:6379', { lazyConnect: true });
mockClient.options = {
  ...mockClient.options,
  ...mockOptions,
};

const mockCluster = Object.create(IORedis.Cluster.prototype);
mockCluster.isCluster = true;
mockCluster.options = {
  redisOptions: mockOptions,
};

const generateRedisConnectionNameTests = [
  { input: ['CLI', CLIENT_ID], expected: `${CONNECTION_NAME_GLOBAL_PREFIX}-cli-235e72f4` },
  { input: ['CLI', CLIENT_ID, '_'], expected: `${CONNECTION_NAME_GLOBAL_PREFIX}_cli_235e72f4` },
  { input: ['workbench', CLIENT_ID], expected: `${CONNECTION_NAME_GLOBAL_PREFIX}-workbench-235e72f4` },
  { input: ['Browser', CLIENT_ID], expected: `${CONNECTION_NAME_GLOBAL_PREFIX}-browser-235e72f4` },
  { input: ['Browser', undefined], expected: CONNECTION_NAME_GLOBAL_PREFIX },
  { input: [], expected: CONNECTION_NAME_GLOBAL_PREFIX },
];

describe('generateRedisConnectionName', () => {
  test.each(generateRedisConnectionNameTests)('%j', ({ input, expected }) => {
    // @ts-ignore
    const result = generateRedisConnectionName(...input);
    expect(result).toEqual(expected);
  });
});

const getConnectionNameTests = [
  { input: mockClient, expected: `${CONNECTION_NAME_GLOBAL_PREFIX}-common-235e72f4` },
  { input: mockCluster, expected: `${CONNECTION_NAME_GLOBAL_PREFIX}-common-235e72f4` },
  { input: undefined, expected: CONNECTION_NAME_GLOBAL_PREFIX },
];

describe('getConnectionName', () => {
  test.each(getConnectionNameTests)('%j', ({ input, expected }) => {
    const result = getConnectionName(input);
    expect(result).toEqual(expected);
  });
});

const getConnectionNamespaceTests = [
  { input: mockClient, expected: 'common' },
  { input: mockCluster, expected: 'common' },
  { input: undefined, expected: '' },
];

describe('getConnectionNamespace', () => {
  test.each(getConnectionNamespaceTests)('%j', ({ input, expected }) => {
    const result = getConnectionNamespace(input);
    expect(result).toEqual(expected);
  });
});
