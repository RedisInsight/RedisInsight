import { StringToJsonStrategy } from 'src/modules/database-recommendation/scanner/strategies';

describe('StringToJsonStrategy', () => {
  let strategy: StringToJsonStrategy;

  beforeEach(async () => {
    strategy = new StringToJsonStrategy();
  });

  describe('isRecommendationReached', () => {
    it('should return false when string value not object or array', async () => {
      expect(await strategy.isRecommendationReached(Buffer.from('value'))).toEqual(false);
    });

    it('should return true when string value is object or array', async () => {
      expect(await strategy.isRecommendationReached(Buffer.from('[1,2]'))).toEqual(true);
      expect(await strategy.isRecommendationReached(Buffer.from('{"foo": "bar"}'))).toEqual(true);
    });
  });
});
