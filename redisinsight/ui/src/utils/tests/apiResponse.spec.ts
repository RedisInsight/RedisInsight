import { getApiErrorMessage } from 'uiSrc/utils'
import { AxiosError } from 'axios'

const error = { response: { data: { message: 'error' } } } as AxiosError
const errors = { response: { data: { message: ['error1', 'error2'] } } } as AxiosError

describe('getApiErrorMessage', () => {
  it('should return proper message', () => {
    expect(getApiErrorMessage(error)).toEqual('error')
    expect(getApiErrorMessage(null)).toEqual('Something was wrong!')
    expect(getApiErrorMessage(errors)).toEqual('error1')
  })
})
