import { ShardHashStrategy } from 'src/modules/database-recommendation/scanner/strategies';

describe('ShardHashStrategy', () => {
  let strategy: ShardHashStrategy;

  beforeEach(async () => {
    strategy = new ShardHashStrategy();
  });

  describe('isRecommendationReached', () => {
    it('should return false when hash length < 5_000', async () => {
      expect(await strategy.isRecommendationReached(100)).toEqual(false);
    });

    it('should return true when hash length > 5_000', async () => {
      expect(await strategy.isRecommendationReached(5_001)).toEqual(true);
    });
  });
});
