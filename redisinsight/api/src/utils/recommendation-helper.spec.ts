import { AdditionalSearchModuleName, AdditionalRedisModuleName } from 'src/constants';
import { isRedisearchModule, sortRecommendations } from './recommendation-helper';

const nameToModule = (name: string) => ({ name });

const getOutputForRedisearchAvailable: any[] = [
  [['1', 'json'].map(nameToModule), false],
  [['1', 'uoeuoeu ueaooe'].map(nameToModule), false],
  [['1', 'json', AdditionalRedisModuleName.RediSearch].map(nameToModule), true],
  [['1', 'json', AdditionalSearchModuleName.SearchLight].map(nameToModule), true],
  [['1', 'json', AdditionalSearchModuleName.FT].map(nameToModule), true],
  [['1', 'json', AdditionalSearchModuleName.FTL].map(nameToModule), true],
];

const sortRecommendationsTests = [
  {
    input: [],
    expected: [],
  },
  {
    input: [
      { name: 'luaScript' },
      { name: 'bigSets' },
      { name: 'searchIndexes' },
    ],
    expected: [
      { name: 'searchIndexes' },
      { name: 'bigSets' },
      { name: 'luaScript' },
    ],
  },
  {
    input: [
      { name: 'luaScript' },
      { name: 'bigSets' },
      { name: 'searchJSON' },
    ],
    expected: [
      { name: 'searchJSON' },
      { name: 'bigSets' },
      { name: 'luaScript' },
    ],
  },
  {
    input: [
      { name: 'luaScript' },
      { name: 'bigSets' },
      { name: 'searchIndexes' },
      { name: 'searchJSON' },
      { name: 'useSmallerKeys' },
      { name: 'RTS' },
    ],
    expected: [
      { name: 'searchJSON' },
      { name: 'searchIndexes' },
      { name: 'RTS' },
      { name: 'bigSets' },
      { name: 'luaScript' },
      { name: 'useSmallerKeys' },
    ],
  },
];

describe('Recommendation helper', () => {
  describe('isRedisearchModule', () => {
    it.each(getOutputForRedisearchAvailable)('for input: %s (reply), should be output: %s',
      (reply, expected) => {
        const result = isRedisearchModule(reply);
        expect(result).toBe(expected);
      });
  });

  describe('sortRecommendations', () => {
    test.each(sortRecommendationsTests)(
      '%j',
      ({ input, expected }) => {
        const result = sortRecommendations(input);
        expect(result).toEqual(expected);
      },
    );
  });
});
