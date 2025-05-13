import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CloudOauthMisconfigurationException } from 'src/modules/cloud/auth/exceptions';
import { AxiosError, AxiosHeaders } from 'axios';
import { mockSessionMetadata } from 'src/__mocks__';
import { getOriginalErrorCause, sanitizeError, sanitizeErrors } from './logsFormatter';

const simpleError = new Error('Original error');
simpleError['some'] = 'field';
const errorWithCause = new NotFoundException('Not found', { cause: simpleError });
const errorWithCauseDepth2 = new BadRequestException('Bad req', { cause: errorWithCause });
const errorWithCauseDepth3 = new CloudOauthMisconfigurationException('Misconfigured', { cause: errorWithCauseDepth2 });
const axiosError = new AxiosError(
  'Request failed with status code 404',
  'NOT_FOUND',
  {
    method: 'get',
    url: '/test-endpoint',
    headers: AxiosHeaders.prototype,
    data: null,
  },
  null,
  {
    status: 404,
    statusText: 'Not Found',
    headers: {},
    config: {
      headers: AxiosHeaders.prototype,
    },
    data: {
      message: 'Resource not found',
    },
  },
);

const mockLogData: any = {
  sessionMetadata: mockSessionMetadata,
  error: errorWithCauseDepth3,
  data: [
    errorWithCauseDepth2,
    {
      any: [
        'other',
        {
          possible: 'data',
          with: [
            'nested',
            'structure',
            errorWithCause,
            {
              error: simpleError,
            },
          ],
        },
      ],
    },
  ],
};
mockLogData.data.push({ circular: mockLogData.data });

describe('logsFormatter', () => {
  describe('getOriginalErrorCause', () => {
    it('should return last cause in the chain', () => {
      expect(getOriginalErrorCause(errorWithCauseDepth3)).toEqual(simpleError);
    });

    it('should return undefined if input is not an Error instance', () => {
      expect(getOriginalErrorCause({ cause: simpleError })).toEqual(undefined);
    });

    it('should not fail if input is not specified', () => {
      expect(getOriginalErrorCause(undefined)).toEqual(undefined);
    });
  });

  describe('sanitizeError', () => {
    it('should sanitize simple error and return only message', () => {
      expect(sanitizeError(simpleError, { omitSensitiveData: true })).toEqual({
        type: 'Error',
        message: simpleError.message,
      });
    });

    it('should sanitize simple error and return message (with stack)', () => {
      expect(sanitizeError(simpleError)).toEqual({
        type: 'Error',
        message: simpleError.message,
        stack: simpleError.stack,
      });
    });

    it('should return sanitized object with a single original cause for nested errors', () => {
      expect(sanitizeError(errorWithCauseDepth3, { omitSensitiveData: true })).toEqual({
        type: 'CloudOauthMisconfigurationException',
        message: errorWithCauseDepth3.message,
        cause: {
          type: 'Error',
          message: simpleError.message,
        },
      });
    });

    it('should return sanitized object with a single original cause for nested errors (with stack)', () => {
      expect(sanitizeError(errorWithCauseDepth3)).toEqual({
        type: 'CloudOauthMisconfigurationException',
        message: errorWithCauseDepth3.message,
        stack: errorWithCauseDepth3.stack,
        cause: {
          type: 'Error',
          message: simpleError.message,
          stack: simpleError.stack,
        },
      });
    });

    it('should sanitize axios error and return only message when sensitive data is omitted', () => {
      expect(sanitizeError(axiosError, { omitSensitiveData: true })).toEqual({
        type: 'AxiosError',
        message: axiosError.message,
      });
    });
  });

  describe('sanitizeErrors', () => {
    it('should sanitize all errors and replace circular dependencies', () => {
      expect(sanitizeErrors(mockLogData, { omitSensitiveData: true })).toEqual({
        sessionMetadata: mockSessionMetadata,
        error: {
          type: 'CloudOauthMisconfigurationException',
          message: 'Misconfigured',
          cause: {
            message: 'Original error',
            type: 'Error',
          },
        },
        data: [
          {
            type: 'BadRequestException',
            message: 'Bad req',
            cause: {
              type: 'Error',
              message: 'Original error',
            },
          },
          {
            any: [
              'other',
              {
                possible: 'data',
                with: [
                  'nested',
                  'structure',
                  {
                    cause: {
                      message: 'Original error',
                      type: 'Error',
                    },
                    message: 'Not found',
                    type: 'NotFoundException',
                  },
                  {
                    error: {
                      message: 'Original error',
                      type: 'Error',
                    },
                  },
                ],
              },
            ],
          },
          {
            circular: '[Circular]',
          },
        ],
      });
    });
  });
});
