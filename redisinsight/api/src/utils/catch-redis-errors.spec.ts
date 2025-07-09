import {
  RedisConnectionAuthUnsupportedException,
  RedisConnectionClusterNodesUnavailableException,
  RedisConnectionFailedException, RedisConnectionIncorrectCertificateException,
  RedisConnectionSentinelMasterRequiredException,
  RedisConnectionTimeoutException,
  RedisConnectionUnauthorizedException,
  RedisConnectionUnavailableException,
} from 'src/modules/redis/exceptions/connection';
import { getRedisConnectionException } from 'src/utils/catch-redis-errors';
import { ReplyError } from 'src/models';
import { CertificatesErrorCodes, RedisErrorCodes } from 'src/constants';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { BadRequestException } from '@nestjs/common';

describe('catch-redis-errors', () => {
  describe('getRedisConnectionExceptions', () => {
    const database = { host: '127.0.0.1', port: 6379 };

    const urlPlaceholder = `${database.host}:${database.port}`;

    it.each([
      {
        error: new BadRequestException(),
        output: new BadRequestException(),
      },
      {
        error: new Error('unknown error'),
        output: new RedisConnectionFailedException('unknown error'),
      },
      {
        error: new Error(RedisErrorCodes.SentinelParamsRequired),
        output: new RedisConnectionSentinelMasterRequiredException(),
      },
      {
        error: new Error(RedisErrorCodes.Timeout),
        output: new RedisConnectionTimeoutException(),
      },
      {
        error: new Error('connection timed out'),
        output: new RedisConnectionTimeoutException(),
      },
      {
        error: new Error(RedisErrorCodes.InvalidPassword),
        output: new RedisConnectionUnauthorizedException(),
      },
      {
        error: new Error(RedisErrorCodes.AuthRequired),
        output: new RedisConnectionUnauthorizedException(),
      },
      {
        error: new Error('ERR invalid password'),
        output: new RedisConnectionUnauthorizedException(),
      },
      {
        error: new Error('ERR unknown command \'auth\''),
        output: new RedisConnectionAuthUnsupportedException(),
      },
      {
        error: new Error(RedisErrorCodes.ClusterAllFailedError),
        output: new RedisConnectionClusterNodesUnavailableException(),
      },
      {
        error: new Error(RedisErrorCodes.ConnectionRefused),
        output: new RedisConnectionUnavailableException(
          ERROR_MESSAGES.INCORRECT_DATABASE_URL(urlPlaceholder),
        ),
      },
      {
        error: new Error(RedisErrorCodes.ConnectionNotFound),
        output: new RedisConnectionUnavailableException(
          ERROR_MESSAGES.INCORRECT_DATABASE_URL(urlPlaceholder),
        ),
      },
      {
        error: new Error(RedisErrorCodes.DNSTimeoutError),
        output: new RedisConnectionUnavailableException(
          ERROR_MESSAGES.INCORRECT_DATABASE_URL(urlPlaceholder),
        ),
      },
      {
        error: { message: 'some message', code: RedisErrorCodes.ConnectionReset },
        output: new RedisConnectionUnavailableException(
          ERROR_MESSAGES.INCORRECT_DATABASE_URL(urlPlaceholder),
        ),
      },
      {
        error: { message: 'some message', code: CertificatesErrorCodes.IncorrectCertificates },
        output: new RedisConnectionIncorrectCertificateException(
          ERROR_MESSAGES.INCORRECT_CERTIFICATES(urlPlaceholder),
        ),
      },
      {
        error: { message: 'some message', code: CertificatesErrorCodes.DepthZeroSelfSignedCert },
        output: new RedisConnectionIncorrectCertificateException(
          ERROR_MESSAGES.INCORRECT_CERTIFICATES(urlPlaceholder),
        ),
      },
      {
        error: { message: 'some message', code: CertificatesErrorCodes.SelfSignedCertInChain },
        output: new RedisConnectionIncorrectCertificateException(
          ERROR_MESSAGES.INCORRECT_CERTIFICATES(urlPlaceholder),
        ),
      },
      {
        error: { message: 'some message', code: CertificatesErrorCodes.OSSLError },
        output: new RedisConnectionIncorrectCertificateException(
          ERROR_MESSAGES.INCORRECT_CERTIFICATES(urlPlaceholder),
        ),
      },
      {
        error: new Error('SSL error'),
        output: new RedisConnectionIncorrectCertificateException(
          ERROR_MESSAGES.INCORRECT_CERTIFICATES(urlPlaceholder),
        ),
      },
      {
        error: new Error(CertificatesErrorCodes.OSSLError),
        output: new RedisConnectionIncorrectCertificateException(
          ERROR_MESSAGES.INCORRECT_CERTIFICATES(urlPlaceholder),
        ),
      },
      {
        error: new Error(CertificatesErrorCodes.IncorrectCertificates),
        output: new RedisConnectionIncorrectCertificateException(
          ERROR_MESSAGES.INCORRECT_CERTIFICATES(urlPlaceholder),
        ),
      },
      {
        error: new Error('ERR unencrypted connection is prohibited'),
        output: new RedisConnectionIncorrectCertificateException(
          ERROR_MESSAGES.INCORRECT_CERTIFICATES(urlPlaceholder),
        ),
      },
    ])('should handle %j', ({ error, output }) => {
      expect(getRedisConnectionException(
        error as ReplyError,
        database,
      )).toEqual(output);
    });
  });
});
