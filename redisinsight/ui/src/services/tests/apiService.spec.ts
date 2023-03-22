import { AxiosRequestConfig } from 'axios'
import { sessionStorageService } from 'uiSrc/services'
import { requestInterceptor } from 'uiSrc/services/apiService'

describe('requestInterceptor', () => {
  it('should properly set db-index to headers', () => {
    sessionStorageService.get = jest.fn().mockReturnValue(5)

    const config: AxiosRequestConfig = {
      headers: {},
      url: 'http://localhost:8080/databases/123-215gg-23/endpoint'
    }

    requestInterceptor(config)
    expect(config?.headers?.['ri-db-index']).toEqual(5)
  })

  it('should not set db-index to headers with url not related to database', () => {
    sessionStorageService.get = jest.fn().mockReturnValue(5)

    const config: AxiosRequestConfig = {
      headers: {},
      url: 'http://localhost:8080/settings/123-215gg-23/endpoint'
    }

    requestInterceptor(config)
    expect(config?.headers?.['ri-db-index']).toEqual(undefined)
  })
})
