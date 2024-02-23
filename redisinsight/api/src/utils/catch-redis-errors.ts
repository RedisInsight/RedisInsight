import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  GatewayTimeoutException,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  MethodNotAllowedException,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ReplyError } from 'src/models';
import { RedisErrorCodes, CertificatesErrorCodes } from 'src/constants';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { EncryptionServiceErrorException } from 'src/modules/encryption/exceptions';
import { RedisClientCommandReply } from 'src/modules/redis/client';

export const isCertError = (error: ReplyError): boolean => {
  try {
    const errorCodesArray: string[] = Object.values(CertificatesErrorCodes);
    return errorCodesArray.includes(error.code)
      || error.code?.includes(CertificatesErrorCodes.OSSLError)
      || error.message.includes('SSL')
      || error.message.includes(CertificatesErrorCodes.OSSLError)
      || error.message.includes(CertificatesErrorCodes.IncorrectCertificates)
      || error.message.includes('ERR unencrypted connection is prohibited');
  } catch (e) {
    return false;
  }
};

export const getRedisConnectionException = (
  error: ReplyError,
  connectionOptions: { host: string, port: number },
  errorPlaceholder: string = '',
): HttpException => {
  const { host, port } = connectionOptions;

  if (error instanceof HttpException) {
    return error;
  }

  if (error?.message) {
    if (error.message.includes(RedisErrorCodes.SentinelParamsRequired)) {
      return new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          error: RedisErrorCodes.SentinelParamsRequired,
          message: ERROR_MESSAGES.SENTINEL_MASTER_NAME_REQUIRED,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (
      error.message.includes(RedisErrorCodes.Timeout)
      || error.message.includes('timed out')
    ) {
      return new GatewayTimeoutException(ERROR_MESSAGES.CONNECTION_TIMEOUT);
    }

    if (
      error.message.includes(RedisErrorCodes.InvalidPassword)
      || error.message.includes(RedisErrorCodes.AuthRequired)
      || error.message === 'ERR invalid password'
    ) {
      return new UnauthorizedException(ERROR_MESSAGES.AUTHENTICATION_FAILED());
    }

    if (error.message === "ERR unknown command 'auth'") {
      return new MethodNotAllowedException(
        ERROR_MESSAGES.COMMAND_NOT_SUPPORTED('auth'),
      );
    }

    if (
      error.message.includes(RedisErrorCodes.ConnectionRefused)
      || error.message.includes(RedisErrorCodes.ConnectionNotFound)
      || error.message.includes(RedisErrorCodes.DNSTimeoutError)
      || error.message.includes('Failed to refresh slots cache')
      || error?.code === RedisErrorCodes.ConnectionReset
    ) {
      return new ServiceUnavailableException(
        ERROR_MESSAGES.INCORRECT_DATABASE_URL(
          errorPlaceholder || `${host}:${port}`,
        ),
      );
    }
    if (isCertError(error)) {
      const message = ERROR_MESSAGES.INCORRECT_CERTIFICATES(errorPlaceholder || `${host}:${port}`);
      return new BadRequestException(message);
    }
  }

  // todo: Move to other place after refactoring
  if (error instanceof EncryptionServiceErrorException) {
    return error;
  }

  if (error?.message) {
    return new BadRequestException(error.message);
  }
  return new InternalServerErrorException();
};

export const catchRedisConnectionError = (
  error: ReplyError,
  connectionOptions: { host: string, port: number },
  errorPlaceholder: string = '',
): HttpException => {
  throw getRedisConnectionException(error, connectionOptions, errorPlaceholder);
};

export const catchAclError = (error: ReplyError): HttpException => {
  // todo: Move to other place after refactoring
  if (
    error instanceof EncryptionServiceErrorException
    || error instanceof NotFoundException
    || error instanceof ConflictException
  ) {
    throw error;
  }

  if (error?.message?.includes(RedisErrorCodes.NoPermission)) {
    throw new ForbiddenException(error.message);
  }
  if (error?.previousErrors?.length) {
    const noPermError: ReplyError = error.previousErrors.find((
      errorItem,
    ) => errorItem?.message?.includes(RedisErrorCodes.NoPermission));

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
