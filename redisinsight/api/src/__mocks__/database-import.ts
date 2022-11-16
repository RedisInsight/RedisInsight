import { DatabaseImportResponse } from 'src/modules/database-import/dto/database-import.response';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { mockDatabase } from 'src/__mocks__/databases';
import { ValidationError } from 'class-validator';

export const mockDatabasesToImportArray = new Array(10).fill(mockDatabase);

export const mockDatabaseImportFile = {
  originalname: 'filename.json',
  mimetype: 'application/json',
  size: 1,
  buffer: Buffer.from(JSON.stringify(mockDatabasesToImportArray)),
};

export const mockDatabaseImportResponse = Object.assign(new DatabaseImportResponse(), {
  total: 10,
  success: 7,
  errors: [new ValidationError(), new BadRequestException(), new ForbiddenException()],
});

export const mockDatabaseImportParseFailedAnalyticsPayload = {

};

export const mockDatabaseImportFailedAnalyticsPayload = {
  failed: mockDatabaseImportResponse.errors.length,
  errors: ['ValidationError', 'BadRequestException', 'ForbiddenException'],
};

export const mockDatabaseImportSucceededAnalyticsPayload = {
  succeed: mockDatabaseImportResponse.success,
};

export const mockDatabaseImportAnalytics = jest.fn(() => ({
  sendImportResults: jest.fn(),
  sendImportFailed: jest.fn(),
}));
