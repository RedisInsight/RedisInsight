import { HttpException, HttpStatus } from '@nestjs/common'

export class AzureApiException extends HttpException {
  constructor(message: string, status = HttpStatus.INTERNAL_SERVER_ERROR) {
    super(message, status)
  }
}

export class AzureAuthenticationException extends AzureApiException {
  constructor(message = 'Azure authentication failed') {
    super(message, HttpStatus.UNAUTHORIZED)
  }
}

export class AzureResourceNotFoundException extends AzureApiException {
  constructor(message = 'Azure resource not found') {
    super(message, HttpStatus.NOT_FOUND)
  }
}

export function parseErrorMessage(error: any): string {
  if (error.response?.data?.message) {
    return error.response.data.message
  }
  return error.message || 'Unknown Azure error'
}

export function wrapAzureError(error: any): Error {
  if (error.response) {
    const { status } = error.response

    if (status === 401 || status === 403) {
      return new AzureAuthenticationException()
    }

    if (status === 404) {
      return new AzureResourceNotFoundException()
    }

    return new AzureApiException(parseErrorMessage(error))
  }

  if (error.request) {
    return new AzureApiException('Network error occurred while connecting to Azure')
  }

  return error
}