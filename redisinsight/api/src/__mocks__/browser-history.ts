export const mockBrowserHistoryService = () => ({
  create: jest.fn(),
  get: jest.fn(),
  list: jest.fn(),
  delete: jest.fn(),
  bulkDelete: jest.fn(),
});
