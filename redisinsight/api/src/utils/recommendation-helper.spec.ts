import { AdditionalSearchModuleName, AdditionalRedisModuleName } from 'src/constants';
import { isRedisearchModule } from './recommendation-helper';

const nameToModule = (name: string) => ({ name });

const getOutputForRedisearchAvailable: any[] = [
  [['1', 'json'].map(nameToModule), false],
  [['1', 'uoeuoeu ueaooe'].map(nameToModule), false],
  [['1', 'json', AdditionalRedisModuleName.RediSearch].map(nameToModule), true],
  [['1', 'json', AdditionalSearchModuleName.SearchLight].map(nameToModule), true],
  [['1', 'json', AdditionalSearchModuleName.FT].map(nameToModule), true],
  [['1', 'json', AdditionalSearchModuleName.FTL].map(nameToModule), true],
];

describe('isRedisearchModule', () => {
  it.each(getOutputForRedisearchAvailable)('for input: %s (reply), should be output: %s',
    (reply, expected) => {
      const result = isRedisearchModule(reply);
      expect(result).toBe(expected);
    });
});
