import {
  ConflictException,
  ForbiddenException,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ReplyError } from 'src/models';
import { RedisErrorCodes, CertificatesErrorCodes } from 'src/constants';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { EncryptionServiceErrorException } from 'src/modules/encryption/exceptions';
import { RedisClientCommandReply } from 'src/modules/redis/client';
import {
  RedisConnectionAuthUnsupportedException,
  RedisConnectionClusterNodesUnavailableException,
  RedisConnectionFailedException,
  RedisConnectionTimeoutException,
  RedisConnectionUnauthorizedException,
  RedisConnectionUnavailableException,
  RedisConnectionSentinelMasterRequiredException,
  RedisConnectionIncorrectCertificateException,
} from 'src/modules/redis/exceptions/connection';

export const isCertError = (error: ReplyError): boolean => {
  try {
    const errorCodesArray: string[] = Object.values(CertificatesErrorCodes);
    return (
      errorCodesArray.includes(error.code) ||
      error.code?.includes(CertificatesErrorCodes.OSSLError) ||
      error.message.includes('SSL') ||
      error.message.includes(CertificatesErrorCodes.OSSLError) ||
      error.message.includes(CertificatesErrorCodes.IncorrectCertificates) ||
      error.message.includes('ERR unencrypted connection is prohibited')
    );
  } catch (e) {
    return false;
  }
};

export const getRedisConnectionException = (
  error: ReplyError,
  connectionOptions: { host: string; port: number },
  errorPlaceholder: string = '',
): HttpException => {
  const { host, port } = connectionOptions;

  if (error instanceof HttpException) {
    return error;
  }

  if (error?.message) {
    if (error.message.includes(RedisErrorCodes.SentinelParamsRequired)) {
      return new RedisConnectionSentinelMasterRequiredException(undefined, { cause: error });
    }

    if (
      error.message.includes(RedisErrorCodes.Timeout) ||
      error.message.includes('timed out')
    ) {
      return new RedisConnectionTimeoutException(undefined, { cause: error });
    }

    if (
      error.message.includes(RedisErrorCodes.InvalidPassword) ||
      error.message.includes(RedisErrorCodes.AuthRequired) ||
      error.message === 'ERR invalid password'
    ) {
      return new RedisConnectionUnauthorizedException(undefined, { cause: error });
    }

    if (error.message === "ERR unknown command 'auth'") {
      return new RedisConnectionAuthUnsupportedException(undefined, { cause: error });
    }

    if (error.message.includes(RedisErrorCodes.ClusterAllFailedError)) {
      return new RedisConnectionClusterNodesUnavailableException(undefined, { cause: error });
    }

    if (
      error.message.includes(RedisErrorCodes.ConnectionRefused) ||
      error.message.includes(RedisErrorCodes.ConnectionNotFound) ||
      error.message.includes(RedisErrorCodes.DNSTimeoutError) ||
      error?.code === RedisErrorCodes.ConnectionReset
    ) {
      return new RedisConnectionUnavailableException(
        ERROR_MESSAGES.INCORRECT_DATABASE_URL(
          errorPlaceholder || `${host}:${port}`,
        ),
        { cause: error },
      );
    }

    if (isCertError(error)) {
      return new RedisConnectionIncorrectCertificateException(
        ERROR_MESSAGES.INCORRECT_CERTIFICATES(
          errorPlaceholder || `${host}:${port}`,
        ),
        { cause: error },
      );
    }
  }

  return new RedisConnectionFailedException(error?.message, { cause: error });
};

export const catchRedisConnectionError = (
  error: ReplyError,
  connectionOptions: { host: string; port: number },
  errorPlaceholder: string = '',
): HttpException => {
  throw getRedisConnectionException(error, connectionOptions, errorPlaceholder);
};

export const catchAclError = (error: ReplyError): HttpException => {
  // todo: Move to other place after refactoring
  if (
    error instanceof EncryptionServiceErrorException ||
    error instanceof NotFoundException ||
    error instanceof ConflictException ||
    error instanceof ServiceUnavailableException ||
    error instanceof RedisConnectionFailedException
  ) {
    throw error;
  }

  if (error?.message?.includes(RedisErrorCodes.NoPermission)) {
    throw new ForbiddenException(error.message);
  }
  if (error?.previousErrors?.length) {
    const noPermError: ReplyError = error.previousErrors.find((errorItem) =>
      errorItem?.message?.includes(RedisErrorCodes.NoPermission),
    );

    if (noPermError) {
      throw new ForbiddenException(noPermError.message);
    }
  }
  throw new InternalServerErrorException(error.message);
};

export const catchTransactionError = (
  transactionError: ReplyError | null,
  transactionResults: [ReplyError, any][],
): void => {
  if (transactionError) {
    throw transactionError;
  }
  const previousErrors = transactionResults
    .map((item: [ReplyError, any]) => item[0])
    .filter((item) => !!item);
  if (previousErrors.length) {
    throw previousErrors[0];
  }
};

export const catchMultiTransactionError = (
  transactionResults: [Error, RedisClientCommandReply][],
): void => {
  transactionResults.forEach(([err]) => {
    if (err) throw err;
  });
};
