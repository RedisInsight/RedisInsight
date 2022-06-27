import { ISettingsProvider } from 'src/modules/core/models/settings-provider.interface';

export type MockType<T> = {
  [P in keyof T]: jest.Mock<any>;
};

export const mockRedisConsumer = () => ({
  execCommand: jest.fn(),
  execPipeline: jest.fn(),
  execPipelineFromClient: jest.fn(),
  getRedisClient: jest.fn(),
  execMulti: jest.fn(),
});

export const mockRedisClusterConsumer = () => ({
  execCommand: jest.fn(),
  execCommandFromNodes: jest.fn(),
  execCommandFromNode: jest.fn(),
  execPipeline: jest.fn(),
  getNodes: jest.fn(),
  getRedisClient: jest.fn(),
});

export const mockQueryBuilderGetOne = jest.fn();
export const mockQueryBuilderGetMany = jest.fn();
export const mockQueryBuilderGetManyRaw = jest.fn();
export const mockCreateQueryBuilder = jest.fn(() => ({
  where: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  leftJoin: jest.fn().mockReturnThis(),
  offset: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  whereInIds: jest.fn().mockReturnThis(),
  execute: jest.fn().mockReturnThis(),
  getRawMany: mockQueryBuilderGetManyRaw,
  getMany: mockQueryBuilderGetMany,
  getOne: mockQueryBuilderGetOne,
}));

export const mockRepository = jest.fn(() => ({
  findOne: jest.fn(),
  find: jest.fn(),
  findByIds: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  remove: jest.fn(),
  createQueryBuilder: mockCreateQueryBuilder,
}));

export const mockSettingsProvider = (): ISettingsProvider => ({
  getSettings: jest.fn(),
  updateSettings: jest.fn(),
  getAgreementsSpec: jest.fn(),
});
