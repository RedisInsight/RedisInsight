import { AdditionalRedisModuleName } from 'src/constants';
import { convertREClusterModuleName } from 'src/modules/redis-enterprise/utils/redis-enterprise-converter';

describe('convertRedisCloudModuleName', () => {
  it('should return exist module name', () => {
    const input = 'ReJSON';

    const output = convertREClusterModuleName(input);

    expect(output).toEqual(AdditionalRedisModuleName.RedisJSON);
  });
  it('should return non-exist module name', () => {
    const input = 'RedisNewModule';

    const output = convertREClusterModuleName(input);

    expect(output).toEqual(input);
  });
});
