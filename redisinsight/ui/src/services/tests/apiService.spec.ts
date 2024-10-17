import { cloneDeep } from 'lodash'
import { sessionStorageService } from 'uiSrc/services'
import { cloudAuthInterceptor, requestInterceptor } from 'uiSrc/services/apiService'
import { ApiEndpoints } from 'uiSrc/constants'
import { cleanup, mockedStore } from 'uiSrc/utils/test-utils'
import { logoutUser } from 'uiSrc/slices/oauth/cloud'
import { store } from 'uiSrc/slices/store'
import { setSSOFlow } from 'uiSrc/slices/instances/cloud'

describe('requestInterceptor', () => {
  it('should properly set db-index to headers', () => {
    sessionStorageService.get = jest.fn().mockReturnValue(5)

    const config: any = {
      headers: {},
      url: 'http://localhost:8080/databases/123-215gg-23/endpoint'
    }

    requestInterceptor(config)
    expect(config?.headers?.['ri-db-index']).toEqual(5)
  })

  it('should not set db-index to headers with url not related to database', () => {
    sessionStorageService.get = jest.fn().mockReturnValue(5)

    const config: any = {
      headers: {},
      url: 'http://localhost:8080/settings/123-215gg-23/endpoint'
    }

    requestInterceptor(config)
    expect(config?.headers?.['ri-db-index']).toEqual(undefined)
  })
})

describe('cloudAuthInterceptor', () => {
  let mockedTestStore: typeof mockedStore
  beforeEach(() => {
    cleanup()
    mockedTestStore = cloneDeep(mockedStore)
    mockedTestStore.clearActions()
  })

  it('should properly handle 401 error, call logogut', async () => {
    jest.spyOn(store, 'dispatch')
      .mockImplementation(mockedTestStore.dispatch as any)
    jest.spyOn(store, 'getState')
      .mockImplementation(mockedTestStore.getState)

    const response: any = {
      response: { status: 401 },
      config: { url: ApiEndpoints.CLOUD_CAPI_KEYS }
    }

    try {
      await cloudAuthInterceptor(response)
    } catch {
      expect(mockedTestStore.getActions()).toEqual([logoutUser(), setSSOFlow()])
    }
  })

  it('should properly handle 401 error, do not call logout', async () => {
    jest.spyOn(store, 'dispatch')
      .mockImplementation(mockedTestStore.dispatch as any)
    jest.spyOn(store, 'getState')
      .mockImplementation(mockedTestStore.getState)

    const response: any = {
      response: { status: 401 },
      config: { url: ApiEndpoints.BULK_ACTIONS_IMPORT }
    }

    try {
      await cloudAuthInterceptor(response)
    } catch {
      expect(mockedTestStore.getActions()).toEqual([])
    }
  })
})
