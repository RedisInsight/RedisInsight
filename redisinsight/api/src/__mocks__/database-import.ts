import { DatabaseImportResponse, DatabaseImportStatus } from 'src/modules/database-import/dto/database-import.response';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { mockDatabase } from 'src/__mocks__/databases';
import { ValidationException } from 'src/common/exceptions';

export const mockDatabasesToImportArray = new Array(10).fill(mockDatabase);

export const mockDatabaseImportFile = {
  originalname: 'filename.json',
  mimetype: 'application/json',
  size: 1,
  buffer: Buffer.from(JSON.stringify(mockDatabasesToImportArray)),
};

export const mockDatabaseImportResultSuccess = {
  index: 0,
  status: DatabaseImportStatus.Success,
  host: mockDatabase.host,
  port: mockDatabase.port,
};

export const mockDatabaseImportResultFail = {
  index: 0,
  status: DatabaseImportStatus.Fail,
  host: mockDatabase.host,
  port: mockDatabase.port,
  errors: [new BadRequestException()],
};

export const mockDatabaseImportResponse = Object.assign(new DatabaseImportResponse(), {
  total: 10,
  success: (new Array(7).fill(mockDatabaseImportResultSuccess)).map((v, index) => ({
    ...v,
    index: index + 3,
  })),
  partial: [],
  fail: [
    new ValidationException('Bad request'),
    new BadRequestException(),
    new ForbiddenException(),
  ].map((error, index) => ({
    ...mockDatabaseImportResultFail,
    index,
    errors: [error],
  })),
});

export const mockDatabaseImportParseFailedAnalyticsPayload = {

};

export const mockDatabaseImportFailedAnalyticsPayload = {
  failed: mockDatabaseImportResponse.fail.length,
  errors: ['ValidationException', 'BadRequestException', 'ForbiddenException'],
};

export const mockDatabaseImportSucceededAnalyticsPayload = {
  succeed: mockDatabaseImportResponse.success.length,
};

export const mockDatabaseImportAnalytics = jest.fn(() => ({
  sendImportResults: jest.fn(),
  sendImportFailed: jest.fn(),
}));

export const mockCertificateImportService = jest.fn(() => {

});
