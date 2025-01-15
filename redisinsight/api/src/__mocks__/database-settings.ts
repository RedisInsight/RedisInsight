import { mockDatabaseId } from 'src/__mocks__/databases';
import { DatabaseSettings } from 'src/modules/database-settings/models/database-settings';
import { DatabaseSettingsEntity } from 'src/modules/database-settings/entities/database-setting.entity';
import { classToClass } from 'src/utils';

export const mockDatabaseSettings = Object.assign(new DatabaseSettings(), {
  databaseId: mockDatabaseId,
  data: JSON.stringify({
    test: 'value',
  }),
});
export const mockDatabaseSettingsEntity = new DatabaseSettingsEntity(
  {
    ...mockDatabaseSettings,
    id: 1,
  },
);
export const mockDatabaseSettingsDto = () => classToClass(DatabaseSettings, mockDatabaseSettingsEntity);

export const mockDatabaseSettingsService = () => ({
  createOrUpdate: jest.fn(),
  get: jest.fn(),
  delete: jest.fn(),
});

export const mockDatabaseSettingsRepository = jest.fn(() => ({
  create: jest.fn(),
  list: jest.fn(),
  read: jest.fn(),
  update: jest.fn(),
  isExist: jest.fn(),
  get: jest.fn(),
  sync: jest.fn(),
  delete: jest.fn(),
  getTotalUnread: jest.fn(),
}));
