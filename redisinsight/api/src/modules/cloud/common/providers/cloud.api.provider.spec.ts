import { CloudRequestUtm, ICloudApiCredentials } from 'src/modules/cloud/common/models';
import { mockDefaultCloudApiHeaders } from 'src/__mocks__';
import { CloudApiProvider } from './cloud.api.provider';

const generateUtmBodyTests = [
  {
    input: null,
    expected: {},
  },
  {
    input: { source: 'source' },
    expected: {
      utm_source: 'source',
    },
  },
  {
    input: { medium: 'medium' },
    expected: {
      utm_medium: 'medium',
    },
  },
  {
    input: { source: 'source', medium: 'medium', campaign: 'campaign' },
    expected: {
      utm_source: 'source',
      utm_medium: 'medium',
      utm_campaign: 'campaign',
    },
  },
  {
    input: { campaign: 'campaign' },
    expected: {
      utm_campaign: 'campaign',
    },
  },
];

const getHeadersTests = [
  {
    input: {},
    expected: { ...mockDefaultCloudApiHeaders },
  },
  {
    input: { apiSessionId: 'id' },
    expected: { ...mockDefaultCloudApiHeaders, cookie: 'JSESSIONID=id' },
  },
  {
    input: { csrf: 'csrf-token' },
    expected: { ...mockDefaultCloudApiHeaders, 'x-csrf-token': 'csrf-token' },
  },
];

describe('CloudApiProvider', () => {
  describe('generateUtmQuery', () => {
    test.each(generateUtmBodyTests)('%j', ({ input, expected }) => {
      expect(CloudApiProvider.generateUtmBody(input as CloudRequestUtm)).toEqual(expected);
    });
  });

  describe('getHeaders', () => {
    test.each(getHeadersTests)('%j', ({ input, expected }) => {
      expect(CloudApiProvider.getHeaders(input as ICloudApiCredentials)).toEqual({ headers: expected });
    });
  });
});
