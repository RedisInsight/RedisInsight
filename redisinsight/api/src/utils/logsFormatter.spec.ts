import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CloudOauthMisconfigurationException } from 'src/modules/cloud/auth/exceptions';
import { AxiosError, AxiosHeaders } from 'axios';
import { mockSessionMetadata } from 'src/__mocks__';
import { getOriginalErrorCause, sanitizeError, sanitizeErrors } from './logsFormatter';

const error1 = new Error('Original error');
error1['some'] = 'field';
const error2 = new NotFoundException('Not found', { cause: error1 });
const error3 = new BadRequestException('Bad req', { cause: error2 });
const error4 = new CloudOauthMisconfigurationException('Misconfigured', { cause: error3 });
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
  error: error4,
  data: [
    error3,
    {
      any: [
        'other',
        {
          possible: 'data',
          with: [
            'nested',
            'structure',
            error2,
            {
              error: error1,
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
      expect(getOriginalErrorCause(error4)).toEqual(error1);
    });

    it('should return undefined if input is not an Error instance', () => {
      expect(getOriginalErrorCause({ cause: error1 })).toEqual(undefined);
    });

    it('should not fail if input is not specified', () => {
      expect(getOriginalErrorCause(undefined)).toEqual(undefined);
    });
  });

  describe('sanitizeError', () => {
    it('should sanitize simple error and return only message', () => {
      expect(sanitizeError(error1, { omitSensitiveData: true })).toEqual({
        type: 'Error',
        message: error1.message,
      });
    });

    it('should sanitize simple error and return message (with stack)', () => {
      expect(sanitizeError(error1)).toEqual({
        type: 'Error',
        message: error1.message,
        stack: error1.stack,
      });
    });

    it('should return sanitized object with a single original cause for nested errors', () => {
      expect(sanitizeError(error4, { omitSensitiveData: true })).toEqual({
        type: 'CloudOauthMisconfigurationException',
        message: error4.message,
        cause: {
          type: 'Error',
          message: error1.message,
        },
      });
    });

    it('should return sanitized object with a single original cause for nested errors (with stack)', () => {
      expect(sanitizeError(error4)).toEqual({
        type: 'CloudOauthMisconfigurationException',
        message: error4.message,
        stack: error4.stack,
        cause: {
          type: 'Error',
          message: error1.message,
          stack: error1.stack,
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
