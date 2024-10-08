import { AxiosError } from 'axios';
import { BadRequestException, HttpStatus } from '@nestjs/common';
import {
  mockAiChatAccessDeniedError,
  mockAiChatBadRequestError,
  mockAiChatInternalServerError,
  mockAiChatUnauthorizedError,
} from 'src/__mocks__';
import {
  AiBadRequestException,
  AiForbiddenException,
  AiInternalServerErrorException,
  AiNotFoundException,
  AiRateLimitMaxTokensException,
  AiRateLimitRequestException,
  AiRateLimitTokenException,
  AiUnauthorizedException,
} from 'src/modules/ai/exceptions';
import { AiServerErrors } from 'src/modules/ai/messages/models';
import { CustomErrorCodes } from 'src/constants';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { wrapAiError } from './ai.error.handler';

describe('wrapConvAiError', () => {
  it('Should return AiBadRequestException of status code is 400', async () => {
    const error = wrapAiError(mockAiChatBadRequestError);
    expect(error).toBeInstanceOf(AiBadRequestException);
    expect(error).toEqual(new AiBadRequestException());
  });
  it('Should return AiUnauthorizedException of status code is 401', async () => {
    const error = wrapAiError(mockAiChatUnauthorizedError);
    expect(error).toBeInstanceOf(AiUnauthorizedException);
    expect(error).toEqual(new AiUnauthorizedException());
  });
  it('Should return AiForbiddenException of status code is 403', async () => {
    const error = wrapAiError(mockAiChatAccessDeniedError);
    expect(error).toBeInstanceOf(AiForbiddenException);
    expect(error).toEqual(new AiForbiddenException());
  });
  it('Should return AiNotFoundException if statusCode is 404', async () => {
    const error = wrapAiError({
      message: 'Requested resource was not found',
      response: {
        statusCode: 404,
      },
    });
    expect(error).toBeInstanceOf(AiNotFoundException);
    expect(error).toEqual(new AiNotFoundException());
  });
  it('Should return AiInternalServerErrorException of status code is 500', async () => {
    const error = wrapAiError(mockAiChatInternalServerError);
    expect(error).toBeInstanceOf(AiInternalServerErrorException);
    expect(error).toEqual(new AiInternalServerErrorException());
  });
  it('Should return AiInternalServerErrorException by default', async () => {
    const mockAxiosError = {
      response: {
        status: 503,
        data: {
          message: 'Unreachable error',
        },
      },
    } as AxiosError;

    const error = wrapAiError(mockAxiosError);
    expect(error).toBeInstanceOf(AiInternalServerErrorException);
    expect(error).toEqual(new AiInternalServerErrorException());
  });
  it('Should return AiInternalServerErrorException if no response field', async () => {
    const mockAxiosError = new Error('some other error') as AxiosError;

    const error = wrapAiError(mockAxiosError);
    expect(error).toBeInstanceOf(AiInternalServerErrorException);
    expect(error).toEqual(new AiInternalServerErrorException());
  });
  it('Should return HttpException if passed children of it', async () => {
    const mockAxiosError = new BadRequestException() as unknown as AxiosError;

    const error = wrapAiError(mockAxiosError);
    expect(error).toBeInstanceOf(BadRequestException);
    expect(error).toEqual(mockAxiosError);
  });
  it('Should throw AiRateLimitTokenException', async () => {
    const error = wrapAiError({
      error: AiServerErrors.RateLimitToken,
      message: 'Rate limit of user for tokens exceeded',
      data:
        { limiterType: 'token', limiterKind: 'user', limiterSeconds: 10 }
      ,
    });
    expect(error).toBeInstanceOf(AiRateLimitTokenException);
    expect(error.getResponse()).toEqual({
      message: 'Rate limit of user for tokens exceeded',
      statusCode: HttpStatus.PAYLOAD_TOO_LARGE,
      error: 'AiRateLimitToken',
      errorCode: CustomErrorCodes.QueryAiRateLimitToken,
      details: {
        limiterType: 'token',
        limiterKind: 'user',
        limiterSeconds: 10,
      },
    });
  });
  it('Should throw AiRateLimitTokenException with default message', async () => {
    const error = wrapAiError({
      error: AiServerErrors.RateLimitToken,
      data:
        { limiterType: 'token', limiterKind: 'user', limiterSeconds: 10 }
      ,
    });
    expect(error).toBeInstanceOf(AiRateLimitTokenException);
    expect(error.getResponse()).toEqual({
      message: ERROR_MESSAGES.AI_QUERY_TOKEN_RATE_LIMIT,
      statusCode: HttpStatus.PAYLOAD_TOO_LARGE,
      error: 'AiRateLimitToken',
      errorCode: CustomErrorCodes.QueryAiRateLimitToken,
      details: {
        limiterType: 'token',
        limiterKind: 'user',
        limiterSeconds: 10,
      },
    });
  });
  it('Should throw AiRateLimitRequestException', async () => {
    const error = wrapAiError({
      error: AiServerErrors.RateLimitRequest,
      message: 'Rate limit of user for requests exceeded',
      data:
        { limiterType: 'request', limiterKind: 'user', limiterSeconds: 1 }
      ,
    });
    expect(error).toBeInstanceOf(AiRateLimitRequestException);
    expect(error.getResponse()).toEqual({
      message: 'Rate limit of user for requests exceeded',
      statusCode: HttpStatus.TOO_MANY_REQUESTS,
      error: 'AiRateLimitRequest',
      errorCode: CustomErrorCodes.QueryAiRateLimitRequest,
      details: {
        limiterType: 'request',
        limiterKind: 'user',
        limiterSeconds: 1,
      },
    });
  });
  it('Should throw AiRateLimitRequestException with default message', async () => {
    const error = wrapAiError({
      error: AiServerErrors.RateLimitRequest,
      data:
        { limiterType: 'request', limiterKind: 'user', limiterSeconds: 1 }
      ,
    });
    expect(error).toBeInstanceOf(AiRateLimitRequestException);
    expect(error.getResponse()).toEqual({
      message: ERROR_MESSAGES.AI_QUERY_REQUEST_RATE_LIMIT,
      statusCode: HttpStatus.TOO_MANY_REQUESTS,
      error: 'AiRateLimitRequest',
      errorCode: CustomErrorCodes.QueryAiRateLimitRequest,
      details: {
        limiterType: 'request',
        limiterKind: 'user',
        limiterSeconds: 1,
      },
    });
  });
  it('Should throw AiRateLimitMaxTokensException', async () => {
    const error = wrapAiError({
      error: AiServerErrors.MaxTokens,
      message: 'Token count exceeds the conversation limit',
      data:
        { tokenLimit: 20000, tokenCount: 575 }
      ,
    });
    expect(error).toBeInstanceOf(AiRateLimitMaxTokensException);
    expect(error.getResponse()).toEqual({
      message: 'Token count exceeds the conversation limit',
      statusCode: HttpStatus.PAYLOAD_TOO_LARGE,
      error: 'AiRateLimitMaxTokens',
      errorCode: CustomErrorCodes.QueryAiRateLimitMaxTokens,
      details: {
        tokenLimit: 20000,
        tokenCount: 575,
      },
    });
  });
  it('Should throw AiRateLimitMaxTokensException with default message', async () => {
    const error = wrapAiError({
      error: AiServerErrors.MaxTokens,
      data:
        { tokenLimit: 20000, tokenCount: 575 }
      ,
    });
    expect(error).toBeInstanceOf(AiRateLimitMaxTokensException);
    expect(error.getResponse()).toEqual({
      message: ERROR_MESSAGES.AI_QUERY_MAX_TOKENS_RATE_LIMIT,
      statusCode: HttpStatus.PAYLOAD_TOO_LARGE,
      error: 'AiRateLimitMaxTokens',
      errorCode: CustomErrorCodes.QueryAiRateLimitMaxTokens,
      details: {
        tokenLimit: 20000,
        tokenCount: 575,
      },
    });
  });
  it('Should throw AiInternalServerErrorException when unsupported rate limiter error', async () => {
    const error = wrapAiError({
      error: 'unsupported',
      message: 'Token count exceeds the conversation limit',
      data:
        { tokenLimit: 20000, tokenCount: 575 }
      ,
    });
    expect(error).toBeInstanceOf(AiInternalServerErrorException);
    expect(error).toEqual(new AiInternalServerErrorException());
  });
  it('additional checks for default values for rate limits errors', async () => {
    expect((new AiRateLimitTokenException().getResponse())).toEqual({
      message: ERROR_MESSAGES.AI_QUERY_TOKEN_RATE_LIMIT,
      statusCode: HttpStatus.PAYLOAD_TOO_LARGE,
      error: 'AiRateLimitToken',
      errorCode: CustomErrorCodes.QueryAiRateLimitToken,
    });
    expect((new AiRateLimitRequestException().getResponse())).toEqual({
      message: ERROR_MESSAGES.AI_QUERY_REQUEST_RATE_LIMIT,
      statusCode: HttpStatus.TOO_MANY_REQUESTS,
      error: 'AiRateLimitRequest',
      errorCode: CustomErrorCodes.QueryAiRateLimitRequest,
    });
    expect((new AiRateLimitMaxTokensException().getResponse())).toEqual({
      message: ERROR_MESSAGES.AI_QUERY_MAX_TOKENS_RATE_LIMIT,
      statusCode: HttpStatus.PAYLOAD_TOO_LARGE,
      error: 'AiRateLimitMaxTokens',
      errorCode: CustomErrorCodes.QueryAiRateLimitMaxTokens,
    });
  });
});
