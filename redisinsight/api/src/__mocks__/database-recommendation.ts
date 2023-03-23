export const mockDatabaseRecommendationService = () => ({
  create: jest.fn(),
  list: jest.fn(),
  check: jest.fn(),
  read: jest.fn(),
});

export const mockDatabaseRecommendationProvider = jest.fn(() => ({
  getStrategy: jest.fn(),
}));
