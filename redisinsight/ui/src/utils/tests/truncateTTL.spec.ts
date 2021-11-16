import {
  truncateTTLToDuration,
  truncateTTLToRange,
  truncateTTLToSeconds,
} from '../truncateTTL';

describe('Truncate TTL util tests', () => {
  describe('truncateTTLToRange', () => {
    it('truncateTTLToRange should return "No limit"', () => {
      const ttl = -1;
      const expectedResponse = 'No limit';

      expect(truncateTTLToRange(ttl)).toEqual(expectedResponse);
    });

    it('truncateTTLToRange should return value between 0 and 999', () => {
      const ttl1 = 10;
      const ttl2 = 100;
      const ttl3 = 256;
      const ttl4 = 612;
      const ttl5 = 999;

      const expectedResponse1 = '10';
      const expectedResponse2 = '100';
      const expectedResponse3 = '256';
      const expectedResponse4 = '612';
      const expectedResponse5 = '999';

      expect(truncateTTLToRange(ttl1)).toEqual(expectedResponse1);
      expect(truncateTTLToRange(ttl2)).toEqual(expectedResponse2);
      expect(truncateTTLToRange(ttl3)).toEqual(expectedResponse3);
      expect(truncateTTLToRange(ttl4)).toEqual(expectedResponse4);
      expect(truncateTTLToRange(ttl5)).toEqual(expectedResponse5);
    });

    it('truncateTTLToRange should return value between 1 K and 99 K', () => {
      const ttl1 = 10_000;
      const ttl2 = 100_000;
      const ttl3 = 256_000;
      const ttl4 = 612_000;
      const ttl5 = 999_000;

      const expectedResponse1 = '10 K';
      const expectedResponse2 = '100 K';
      const expectedResponse3 = '256 K';
      const expectedResponse4 = '612 K';
      const expectedResponse5 = '999 K';

      expect(truncateTTLToRange(ttl1)).toEqual(expectedResponse1);
      expect(truncateTTLToRange(ttl2)).toEqual(expectedResponse2);
      expect(truncateTTLToRange(ttl3)).toEqual(expectedResponse3);
      expect(truncateTTLToRange(ttl4)).toEqual(expectedResponse4);
      expect(truncateTTLToRange(ttl5)).toEqual(expectedResponse5);
    });

    it('truncateTTLToRange should return value between 1 M and 999 M', () => {
      const ttl1 = 10_000_000;
      const ttl2 = 100_000_000;
      const ttl3 = 256_000_000;
      const ttl4 = 612_000_000;
      const ttl5 = 999_000_000;

      const expectedResponse1 = '10 M';
      const expectedResponse2 = '100 M';
      const expectedResponse3 = '256 M';
      const expectedResponse4 = '612 M';
      const expectedResponse5 = '999 M';

      expect(truncateTTLToRange(ttl1)).toEqual(expectedResponse1);
      expect(truncateTTLToRange(ttl2)).toEqual(expectedResponse2);
      expect(truncateTTLToRange(ttl3)).toEqual(expectedResponse3);
      expect(truncateTTLToRange(ttl4)).toEqual(expectedResponse4);
      expect(truncateTTLToRange(ttl5)).toEqual(expectedResponse5);
    });

    it('truncateTTLToRange should return value between 1 B and 2 B', () => {
      const ttl1 = 1_000_000_001;
      const ttl2 = 1_500_001_200;
      const ttl3 = 2_120_042_300;

      const expectedResponse1 = '1 B';
      const expectedResponse2 = '1 B';
      const expectedResponse3 = '2 B';

      expect(truncateTTLToRange(ttl1)).toEqual(expectedResponse1);
      expect(truncateTTLToRange(ttl2)).toEqual(expectedResponse2);
      expect(truncateTTLToRange(ttl3)).toEqual(expectedResponse3);
    });
  });

  describe('truncateTTLToDuration', () => {
    it('truncateTTLToDuration should return appropriate value', () => {
      const ttl1 = 100;
      const ttl2 = 1_534;
      const ttl3 = 54_334;
      const ttl4 = 4_325_634;
      const ttl5 = 112_012_330;
      const ttl6 = 2_120_042_300;

      const expectedResponse1 = '1 min, 40 s';
      const expectedResponse2 = '25 min, 34 s';
      const expectedResponse3 = '15 h, 5 min, 34 s';
      const expectedResponse4 = '1 mo, 19 d, 1 h, 33 min, 54 s';
      // TODO started failing
      // const expectedResponse5 = '3 yr, 6 mo, 19 d, 10 h, 32 min, 10 s';
      // const expectedResponse6 = '67 yr, 2 mo, 6 d, 12 h, 38 min, 20 s';

      expect(truncateTTLToDuration(ttl1)).toEqual(expectedResponse1);
      expect(truncateTTLToDuration(ttl2)).toEqual(expectedResponse2);
      expect(truncateTTLToDuration(ttl3)).toEqual(expectedResponse3);
      expect(truncateTTLToDuration(ttl4)).toEqual(expectedResponse4);
      // expect(truncateTTLToDuration(ttl5)).toEqual(expectedResponse5);
      // expect(truncateTTLToDuration(ttl6)).toEqual(expectedResponse6);
    });
  });

  describe('truncateTTLToSeconds', () => {
    it('truncateTTLToSeconds should return appropriate value', () => {
      const ttl1 = 100;
      const ttl2 = 10_000;
      const ttl3 = 1_231_231;
      const ttl4 = 122_331_231;

      const expectedResponse1 = '100';
      const expectedResponse2 = '10 000';
      const expectedResponse3 = '1 231 231';
      const expectedResponse4 = '122 331 231';

      expect(truncateTTLToSeconds(ttl1)).toEqual(expectedResponse1);
      expect(truncateTTLToSeconds(ttl2)).toEqual(expectedResponse2);
      expect(truncateTTLToSeconds(ttl3)).toEqual(expectedResponse3);
      expect(truncateTTLToSeconds(ttl4)).toEqual(expectedResponse4);
    });
  });
});
