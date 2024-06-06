import { AxiosError } from 'axios'
import { first, isArray, get } from 'lodash'
import { AddRedisDatabaseStatus, EnhancedAxiosError, IBulkOperationResult } from 'uiSrc/slices/interfaces'
import { parseCloudOAuthError } from 'uiSrc/utils/oauth'

export const DEFAULT_ERROR_MESSAGE = 'Something was wrong!'

export const getAxiosError = (error: EnhancedAxiosError): AxiosError => {
  if (error?.response?.data.errorCode) {
    return parseCloudOAuthError(error.response.data)
  }
  return error
}

export const getApiErrorCode = (error: AxiosError) => error?.response?.status

export function getApiErrorMessage(error: AxiosError): string {
  const errorMessage = error?.response?.data?.message
  if (!error || !error.response) {
    return DEFAULT_ERROR_MESSAGE
  }
  if (isArray(errorMessage)) {
    return first(errorMessage)
  }
  return errorMessage
}

export function getApiErrorName(error: AxiosError): string {
  return get(error, 'response.data.name', 'Error') ?? ''
}

export function getApiErrorsFromBulkOperation(
  operations: IBulkOperationResult[],
  ...errorNames: string[]
): AxiosError[] {
  let result: AxiosError<any>[] = []
  try {
    result = operations
      .filter((item) => item.status === AddRedisDatabaseStatus.Fail)
      .filter((item) => (errorNames.length ? errorNames.includes(item?.error?.name) : true))
      .map((item) => ({ response: { data: item.error } } as AxiosError))
  } catch (e) {
    // continue regardless of error
  }
  return result
}
