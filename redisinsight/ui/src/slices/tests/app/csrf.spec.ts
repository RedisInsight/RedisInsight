import { cloneDeep } from 'lodash'
import reducer, { appCsrfSelector, fetchCsrfToken, initialState, setLoading, setToken } from 'uiSrc/slices/app/csrf'
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

  it('reducer should properly set the token', () => {
    const nextState = reducer(initialState, setToken({ token: 'abc-123' }))

    const newState = {
      ...initialStateDefault,
      app: {
        ...initialStateDefault.app,
        csrf: nextState,
      }
    }

    expect(appCsrfSelector(newState).token).toEqual('abc-123')
  })

  it('reducer should properly set the loading state', () => {
    const nextState = reducer(initialState, setLoading({ loading: false }))

    const newState = {
      ...initialStateDefault,
      app: {
        ...initialStateDefault.app,
        csrf: nextState,
      }
    }

    expect(appCsrfSelector(newState).loading).toEqual(false)
  })

  it('fetchCsrfToken should fetch the token', async () => {
    process.env.RI_CSRF_ENDPOINT = 'http://localhost'

    apiService.get = jest.fn().mockResolvedValue({
      data: {
        token: 'xyz-456'
      }
    })
    await store.dispatch<any>(fetchCsrfToken())

    expect(store.getActions()).toEqual([
      setToken({ token: 'xyz-456' }),
      setLoading({ loading: false })
    ])
  })

  it('fetchCsrfToken should not fetch the token when endpoint is not provided', async () => {
    await store.dispatch<any>(fetchCsrfToken())

    expect(store.getActions()).toEqual([
      setLoading({ loading: false })
    ])
  })
})
