import { AdditionalRedisModuleName } from 'src/constants';
import { convertRECloudModuleName } from 'src/modules/cloud/autodiscovery/utils/redis-cloud-converter';

describe('convertRedisCloudModuleName', () => {
  it('should return exist module name', () => {
    const input = 'RedisJSON';

    const output = convertRECloudModuleName(input);

    expect(output).toEqual(AdditionalRedisModuleName.RedisJSON);
  });
  it('should return non-exist module name', () => {
    const input = 'RedisNewModule';

    const output = convertRECloudModuleName(input);

    expect(output).toEqual(input);
  });
});
