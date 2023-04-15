import { DatabaseRecommendation } from 'src/modules/database-recommendation/models';
import { mockDatabaseId } from 'src/__mocks__/databases';

export const mockDatabaseRecommendationId = 'databaseRecommendationID';

export const mockDatabaseRecommendation = Object.assign(new DatabaseRecommendation(), {
  id: mockDatabaseRecommendationId,
  name: 'string',
  databaseId: mockDatabaseId,
  read: false,
  disabled: false,
  hide: false,
});

export const mockDatabaseRecommendationService = () => ({
  create: jest.fn(),
  list: jest.fn(),
  check: jest.fn(),
  read: jest.fn(),
});

export const mockDatabaseRecommendationProvider = jest.fn(() => ({
  getStrategy: jest.fn(),
}));
