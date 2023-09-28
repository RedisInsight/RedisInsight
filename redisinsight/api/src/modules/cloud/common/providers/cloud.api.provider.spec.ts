import { CloudRequestUtm, ICloudApiCredentials } from 'src/modules/cloud/common/models';
import { CloudApiProvider } from './cloud.api.provider';

const generateUtmQueryTests = [
  {
    input: null,
    expected: null,
  },
  {
    input: { source: 'source' },
    expected: new URLSearchParams([
      ['utm_source', 'source'],
    ]),
  },
  {
    input: { medium: 'medium' },
    expected: new URLSearchParams([
      ['utm_medium', 'medium'],
    ]),
  },
  {
    input: { source: 'source', medium: 'medium', campaign: 'campaign' },
    expected: new URLSearchParams([
      ['utm_source', 'source'],
      ['utm_medium', 'medium'],
      ['utm_campaign', 'campaign'],
    ]),
  },
  {
    input: { campaign: 'campaign' },
    expected: new URLSearchParams([
      ['utm_campaign', 'campaign'],
    ]),
  },
];

const getHeadersTests = [
  {
    input: {},
    expected: {},
  },
  {
    input: { apiSessionId: 'id' },
    expected: { cookie: 'JSESSIONID=id' },
  },
  {
    input: { csrf: 'csrf-token' },
    expected: { 'x-csrf-token': 'csrf-token' },
  },
];

describe('CloudApiProvider', () => {
  describe('generateUtmQuery', () => {
    test.each(generateUtmQueryTests)('%j', ({ input, expected }) => {
      expect(CloudApiProvider.generateUtmQuery(input as CloudRequestUtm)).toEqual(expected);
    });
  });

  describe('getHeaders', () => {
    test.each(getHeadersTests)('%j', ({ input, expected }) => {
      expect(CloudApiProvider.getHeaders(input as ICloudApiCredentials)).toEqual({ headers: expected });
    });
  });
});
