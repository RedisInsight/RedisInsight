import { RTSStrategy } from 'src/modules/database-recommendation/scanner/strategies';

const mockTimestampName = Buffer.from('1234567891');
const mockDefaultName = Buffer.from('name');

const mockTimestampScore = 1234567891;
const mockDefaultScore = 1;

const mockTimestampNameMembers = new Array(98).fill(
  {
    name: mockTimestampName, score: mockDefaultScore,
  },
);

const mockTimestampScoreMembers = new Array(98).fill(
  {
    name: mockDefaultName, score: mockTimestampScore,
  },
);

const mockDefaultMembers = new Array(1).fill(
  {
    name: mockDefaultName, score: mockDefaultScore,
  },
);

const mockKeyName = 'name';

describe('RTSStrategy', () => {
  let strategy: RTSStrategy;

  beforeEach(async () => {
    strategy = new RTSStrategy();
  });

  describe('isRecommendationReached', () => {
    it('should return false when members has less then 99% timestamp members', async () => {
      const mockMembers = [].concat(mockTimestampNameMembers, mockDefaultMembers);
      const mockData = { members: mockMembers, keyName: mockKeyName };
      expect(await strategy.isRecommendationReached(mockData)).toEqual({ isReached: false });
    });

    it('should return false when members has less then 99% timestamp scores', async () => {
      const mockMembers = [].concat(mockTimestampScoreMembers, mockDefaultMembers);
      const mockData = { members: mockMembers, keyName: mockKeyName };
      expect(await strategy.isRecommendationReached(mockData)).toEqual({ isReached: false });
    });

    it('should return true when members has at least then 99% timestamp members', async () => {
      const mockMembers = [].concat(
        mockTimestampNameMembers,
        mockDefaultMembers,
        [{ name: mockTimestampName, score: mockDefaultScore }],
      );
      const mockData = { members: mockMembers, keyName: mockKeyName };
      expect(await strategy.isRecommendationReached(mockData)).toEqual({ isReached: true, params: { keys: [mockKeyName] } });
    });

    it('should return true when members has at least then 99% timestamp score', async () => {
      const mockMembers = [].concat(
        mockTimestampScoreMembers,
        mockDefaultMembers,
        [{ name: mockDefaultName, score: mockTimestampScore }],
      );
      const mockData = { members: mockMembers, keyName: mockKeyName };
      expect(await strategy.isRecommendationReached(mockData)).toEqual({ isReached: true, params: { keys: [mockKeyName] } });
    });
  });
});
