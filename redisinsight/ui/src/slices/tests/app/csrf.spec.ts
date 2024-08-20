import { cloneDeep } from 'lodash'
import reducer, {
  appCsrfSelector,
  fetchCsrfTokenAction,
  initialState,
  fetchCsrfToken,
  fetchCsrfTokenSuccess,
  fetchCsrfTokenFail
} from 'uiSrc/slices/app/csrf'
import {
  cleanup,
  initialStateDefault,
  mockedStore,
} from 'uiSrc/utils/test-utils'
import { apiService } from 'uiSrc/services'
import { envConfig } from 'uiSrc/env-config'

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('slices', () => {
  const OLD_ENV_CONFIG = { ...envConfig }

  beforeEach(() => {
    envConfig.RI_CSRF_ENDPOINT = OLD_ENV_CONFIG.RI_CSRF_ENDPOINT
  })
  afterAll(() => {
    envConfig.RI_CSRF_ENDPOINT = OLD_ENV_CONFIG.RI_CSRF_ENDPOINT
  })

  it('fetch token reducer should properly set the token', () => {
    const nextState = reducer(initialState, fetchCsrfToken())

    const newState = {
      ...initialStateDefault,
      app: {
        ...initialStateDefault.app,
        csrf: nextState,
      }
    }

    expect(appCsrfSelector(newState).loading).toEqual(true)
  })

  it('fetch token success reducer should properly set the state', () => {
    const nextState = reducer(initialState, fetchCsrfTokenSuccess({ token: 'xyz-456' }))

    const newState = {
      ...initialStateDefault,
      app: {
        ...initialStateDefault.app,
        csrf: nextState,
      }
    }

    expect(appCsrfSelector(newState).token).toEqual('xyz-456')
    expect(appCsrfSelector(newState).loading).toEqual(false)
  })

  it('fetch token failure reducer should properly set the state', () => {
    const nextState = reducer(initialState, fetchCsrfTokenFail({ error: 'something went wrong' }))

    const newState = {
      ...initialStateDefault,
      app: {
        ...initialStateDefault.app,
        csrf: nextState,
      }
    }

    expect(appCsrfSelector(newState).token).toEqual('')
    expect(appCsrfSelector(newState).loading).toEqual(false)
    expect(appCsrfSelector(newState).error).toEqual('something went wrong')
  })

  it('fetchCsrfToken should fetch the token', async () => {
    envConfig.RI_CSRF_ENDPOINT = 'http://localhost'

    apiService.get = jest.fn().mockResolvedValueOnce({
      data: {
        token: 'xyz-456'
      }
    })
    const successFn = jest.fn()
    const failFn = jest.fn()
    await store.dispatch<any>(fetchCsrfTokenAction(successFn, failFn))

    expect(store.getActions()).toEqual([
      fetchCsrfToken(),
      fetchCsrfTokenSuccess({ token: 'xyz-456' })
    ])
    expect(successFn).toHaveBeenCalledWith({ token: 'xyz-456' })
    expect(failFn).not.toHaveBeenCalled()
  })

  it('fetchCsrfToken should handle failure', async () => {
    envConfig.RI_CSRF_ENDPOINT = 'http://localhost'

    apiService.get = jest.fn().mockRejectedValueOnce(new Error('something went wrong'))
    const successFn = jest.fn()
    const failFn = jest.fn()
    await store.dispatch<any>(fetchCsrfTokenAction(successFn, failFn))

    expect(store.getActions()).toEqual([
      fetchCsrfToken(),
      fetchCsrfTokenFail({ error: 'something went wrong' })
    ])
    expect(successFn).not.toHaveBeenCalled()
    expect(failFn).toHaveBeenCalled()
  })

  it('fetchCsrfToken should not fetch the token when endpoint is not provided', async () => {
    await store.dispatch<any>(fetchCsrfTokenAction())

    expect(store.getActions()).toEqual([])
  })
})
