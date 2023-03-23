import { RTSStrategy } from 'src/modules/database-recommendation/scanner/strategies';

const mockTimestampName = Buffer.from('1234567891');
const mockDefaultName = Buffer.from('name');

const mockTimestampScore = 1234567891;
const mockDefaultScore = 1;

const mockTimestampNameMembers = new Array(95).fill(
  {
    name: mockTimestampName, score: mockDefaultScore,
  },
);

const mockTimestampScoreMembers = new Array(95).fill(
  {
    name: mockDefaultName, score: mockTimestampScore,
  },
);

const mockDefaultMembers = new Array(5).fill(
  {
    name: mockDefaultName, score: mockDefaultScore,
  },
);

describe('RTSStrategy', () => {
  let strategy: RTSStrategy;

  beforeEach(async () => {
    strategy = new RTSStrategy();
  });

  describe('isRecommendationReached', () => {
    it('should return false when members has less then 95% timestamp members', async () => {
      const mockMembers = [].concat(mockTimestampNameMembers, mockDefaultMembers);
      expect(await strategy.isRecommendationReached(mockMembers)).toEqual(false);
    });

    it('should return false when members has less then 95% timestamp scores', async () => {
      const mockMembers = [].concat(mockTimestampScoreMembers, mockDefaultMembers);
      expect(await strategy.isRecommendationReached(mockMembers)).toEqual(false);
    });

    it('should return true when members has at least then 95% timestamp members', async () => {
      const mockMembers = [].concat(
        mockTimestampNameMembers,
        mockDefaultMembers,
        [{ name: mockTimestampName, score: mockDefaultScore }],
      );
      expect(await strategy.isRecommendationReached(mockMembers)).toEqual(true);
    });

    it('should return true when members has at least then 95% timestamp score', async () => {
      const mockMembers = [].concat(
        mockTimestampScoreMembers,
        mockDefaultMembers,
        [{ name: mockDefaultName, score: mockTimestampScore }],
      );
      expect(await strategy.isRecommendationReached(mockMembers)).toEqual(true);
    });
  });
});
