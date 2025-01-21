import { cloneDeep } from 'lodash'
import { rest } from 'msw'
import { waitFor } from '@testing-library/react'
import { cleanup, getMswURL, initialStateDefault, mockedStore } from 'uiSrc/utils/test-utils'
import { mswServer } from 'uiSrc/mocks/server'
import { store } from 'uiSrc/slices/store'
import reducer, {
  appConnectivity, appConnectivityError,
  initialState, retryConnection,
  setConnectivityError,
  setConnectivityLoading
} from 'uiSrc/slices/app/connectivity'
import { ApiEndpoints } from 'uiSrc/constants'
import {
  getDatabaseConfigInfo,
  getDatabaseConfigInfoFailure,
  getDatabaseConfigInfoSuccess
} from 'uiSrc/slices/instances/instances'

let testStore: typeof mockedStore
const onSuccessAction = jest.fn()
const onFailAction = jest.fn()

beforeEach(() => {
  cleanup()
  jest.resetAllMocks()
  testStore = cloneDeep(mockedStore)
  testStore.clearActions()
})

describe('app connectivity slice', () => {
  describe('setConnectivityLoading reducer', () => {
    it('should set loading to true', () => {
      const nextState = reducer(initialState, setConnectivityLoading(true))
      const expectedState = {
        loading: true,
        error: undefined
      }
      expect(nextState).toEqual(expectedState)
    })

    it('should set loading to false', () => {
      const nextState = reducer(initialState, setConnectivityLoading(false))
      const expectedState = {
        loading: false,
        error: undefined
      }
      expect(nextState).toEqual(expectedState)
    })
  })

  describe('setConnectivityError reducer', () => {
    it('should set connectivity error to a value', () => {
      const nextState = reducer(initialState, setConnectivityError('Test error message'))
      const expectedState = {
        loading: false,
        error: 'Test error message'
      }
      expect(nextState).toEqual(expectedState)
    })

    it('should set connectivity error to null', () => {
      const nextState = reducer(initialState, setConnectivityError(null))
      const expectedState = {
        loading: false,
        error: null
      }
      expect(nextState).toEqual(expectedState)
    })
  })

  describe('retryConnection', () => {
    it('should handle success path', async () => {
      const getDbOverviewMock = jest.fn((_req, res, ctx) => res(ctx.json({})))
      mswServer.use(
        rest.get(getMswURL(`${ApiEndpoints.DATABASES}/123/overview`), getDbOverviewMock)
      )

      testStore.dispatch<any>(retryConnection('123', onSuccessAction, onFailAction))

      await waitFor(() => {
        expect(getDbOverviewMock).toHaveBeenCalledTimes(1)

        const expectedActions = [
          setConnectivityLoading(true),
          getDatabaseConfigInfo(),
          getDatabaseConfigInfoSuccess({}),
          setConnectivityError(null),
          setConnectivityLoading(false),
        ]

        expect(mockedStore.getActions()).toEqual(expectedActions)
      })

      expect(onSuccessAction).toHaveBeenCalledTimes(1)
      expect(onFailAction).not.toHaveBeenCalled()
    })

    it('should handle failure path', async () => {
      jest.spyOn(store, 'dispatch').mockImplementation((action: any) => {
        mockedStore.dispatch(action)
      })
      const getDbOverviewMock = jest.fn((_req, res, ctx) => res(ctx.status(503), ctx.json({ code: 'serviceUnavailable', message: 'Test error' })))
      mswServer.use(
        rest.get(getMswURL(`${ApiEndpoints.DATABASES}/123/overview`), getDbOverviewMock)
      )

      testStore.dispatch<any>(retryConnection('123', onSuccessAction, onFailAction))

      await waitFor(() => {
        expect(getDbOverviewMock).toHaveBeenCalledTimes(1)

        const expectedActions = [
          setConnectivityLoading(true),
          getDatabaseConfigInfo(),
          setConnectivityError('The connection to the server has been lost.'),
          getDatabaseConfigInfoFailure('Test error'),
          setConnectivityLoading(false),
        ]

        expect(mockedStore.getActions()).toEqual(expectedActions)
      })

      expect(onSuccessAction).not.toHaveBeenCalled()
      expect(onFailAction).toHaveBeenCalledTimes(1)
    })
  })

  describe('selectors', () => {
    it('should get state after error is set', async () => {
      testStore.dispatch<any>(setConnectivityError('Test error'))
      testStore.dispatch<any>(setConnectivityLoading(true))

      const expectedState = { error: 'Test error', loading: true }
      const rootState = Object.assign(initialStateDefault, {
        app: { connectivity: expectedState },
      })

      await waitFor(() => {
        const actualValue = appConnectivity(rootState)
        expect(actualValue).toStrictEqual(expectedState)
        expect(appConnectivityError(rootState)).toStrictEqual(expectedState.error)
      })
    })

    it('should get state after error is cleared', async () => {
      testStore.dispatch<any>(setConnectivityError('Test error'))
      testStore.dispatch<any>(setConnectivityLoading(true))
      testStore.dispatch<any>(setConnectivityError(null))
      testStore.dispatch<any>(setConnectivityLoading(false))

      const expectedState = { error: null, loading: false }
      const rootState = Object.assign(initialStateDefault, {
        app: { connectivity: expectedState },
      })

      await waitFor(() => {
        const actualValue = appConnectivity(rootState)
        expect(actualValue).toStrictEqual(expectedState)
        expect(appConnectivityError(rootState)).toStrictEqual(expectedState.error)
      })
    })
  })
})
