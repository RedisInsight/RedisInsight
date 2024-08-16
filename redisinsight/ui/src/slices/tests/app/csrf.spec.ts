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

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('slices', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    process.env = { ...OLD_ENV }
  })
  afterAll(() => {
    process.env = OLD_ENV
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

  it('fetchCsrfToken should fetch the token', async () => {
    process.env.RI_CSRF_ENDPOINT = 'http://localhost'

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
    process.env.RI_CSRF_ENDPOINT = 'http://localhost'

    apiService.get = jest.fn().mockRejectedValueOnce(new Error('error'))
    const successFn = jest.fn()
    const failFn = jest.fn()
    await store.dispatch<any>(fetchCsrfTokenAction(successFn, failFn))

    expect(store.getActions()).toEqual([
      fetchCsrfToken(),
      fetchCsrfTokenFail()
    ])
    expect(successFn).not.toHaveBeenCalled()
    expect(failFn).toHaveBeenCalled()
  })

  it('fetchCsrfToken should not fetch the token when endpoint is not provided', async () => {
    await store.dispatch<any>(fetchCsrfTokenAction())

    expect(store.getActions()).toEqual([])
  })
})
