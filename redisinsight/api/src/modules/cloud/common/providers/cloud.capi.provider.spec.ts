import { ICloudCapiCredentials } from 'src/modules/cloud/common/models';
import { CloudSubscriptionType } from 'src/modules/cloud/subscription/models';
import { CloudCapiProvider } from './cloud.capi.provider';

const getPrefixTests = [
  {
    input: undefined,
    expected: '',
  },
  {
    input: CloudSubscriptionType.Fixed,
    expected: '/fixed',
  },
  {
    input: CloudSubscriptionType.Flexible,
    expected: '',
  },
];

const getHeadersTests = [
  {
    input: {},
    expected: { 'x-api-key': undefined, 'x-api-secret-key': undefined, 'User-Agent': 'RedisInsight/2.32.0' },
  },
  {
    input: { capiKey: 'key' },
    expected: { 'x-api-key': 'key', 'x-api-secret-key': undefined, 'User-Agent': 'RedisInsight/2.32.0' },
  },
  {
    input: { capiSecret: 'secret' },
    expected: { 'x-api-key': undefined, 'x-api-secret-key': 'secret', 'User-Agent': 'RedisInsight/2.32.0' },
  },
  {
    input: { capiKey: 'key', capiSecret: 'secret' },
    expected: { 'x-api-key': 'key', 'x-api-secret-key': 'secret', 'User-Agent': 'RedisInsight/2.32.0' },
  },
];

describe('CloudCapiProvider', () => {
  describe('getPrefix', () => {
    test.each(getPrefixTests)('%j', ({ input, expected }) => {
      expect(CloudCapiProvider.getPrefix(input as CloudSubscriptionType)).toEqual(expected);
    });
  });

  describe('getHeaders', () => {
    test.each(getHeadersTests)('%j', ({ input, expected }) => {
      expect(CloudCapiProvider.getHeaders(input as ICloudCapiCredentials)).toEqual({ headers: expected });
    });
  });
});
