import { HostingProvider } from 'src/modules/core/models/database-instance.entity';
import { getHostingProvider } from './hosting-provider-helper';

const getHostingProviderTests = [
  { input: '127.0.0.1', output: HostingProvider.LOCALHOST },
  { input: '0.0.0.0', output: HostingProvider.LOCALHOST },
  { input: 'localhost', output: HostingProvider.LOCALHOST },
  { input: '172.18.0.2', output: HostingProvider.LOCALHOST },
  { input: '176.87.56.244', output: HostingProvider.UNKNOWN },
  { input: '192.12.56.244', output: HostingProvider.UNKNOWN },
  { input: '255.255.56.244', output: HostingProvider.UNKNOWN },
  { input: 'redis', output: HostingProvider.UNKNOWN },
  { input: 'demo-redislabs.rlrcp.com', output: HostingProvider.RE_CLOUD },
  {
    input: 'redis-16781.c273.us-east-1-2.ec2.cloud.redislabs.com',
    output: HostingProvider.RE_CLOUD,
  },
  {
    input: 'askubuntu.mki5tz.0001.use1.cache.amazonaws.com',
    output: HostingProvider.AWS,
  },
  { input: 'contoso5.redis.cache.windows.net', output: HostingProvider.AZURE },
  { input: 'demo-redis-provider.unknown.com', output: HostingProvider.UNKNOWN },
];

describe('getHostingProvider', () => {
  getHostingProviderTests.forEach((test) => {
    it(`should be output: ${test.output} for input: ${test.input} `, async () => {
      const result = getHostingProvider(test.input);

      expect(result).toEqual(test.output);
    });
  });
});
