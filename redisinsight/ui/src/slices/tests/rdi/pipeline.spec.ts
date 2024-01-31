import { cloneDeep } from 'lodash'
import { AxiosError } from 'axios'
import { AnyAction } from '@reduxjs/toolkit'
import { cleanup, clearStoreActions, initialStateDefault, mockedStore } from 'uiSrc/utils/test-utils'
import reducer, {
  initialState,
  getPipeline,
  getPipelineSuccess,
  getPipelineFailure,
  deployPipeline,
  deployPipelineSuccess,
  deployPipelineFailure,
  fetchRdiPipeline,
  deployPipelineAction,
  rdiPipelineSelector,
} from 'uiSrc/slices/rdi/pipeline'
import { apiService } from 'uiSrc/services'
import { addErrorNotification, addInfiniteNotification } from 'uiSrc/slices/app/notifications'
import { INFINITE_MESSAGES } from 'uiSrc/components/notifications/components'

let store: typeof mockedStore

beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('rdi pipe slice', () => {
  describe('reducer, actions and selectors', () => {
    it('should return the initial state', () => {
      // Arrange
      const nextState = initialState

      // Act
      const result = reducer(undefined, {} as AnyAction)

      // Assert
      expect(result).toEqual(nextState)
    })
  })

  describe('rdiPipelineSelector', () => {
    it('should properly set state', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: true,
      }

      // Act
      const nextState = reducer(initialState, getPipeline())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        rdi: {
          pipeline: nextState,
        }
      })
      expect(rdiPipelineSelector(rootState)).toEqual(state)
    })
  })

  describe('getPipelineSuccess', () => {
    it('should properly set state', () => {
      // Arrange
      const pipeline = { config: 'string', jobs: [] }
      const state = {
        ...initialState,
        loading: false,
        data: pipeline,
      }
      // Act
      const nextState = reducer(initialState, getPipelineSuccess(pipeline))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        rdi: {
          pipeline: nextState,
        }
      })
      expect(rdiPipelineSelector(rootState)).toEqual(state)
    })
  })

  describe('getPipelineFailure', () => {
    it('should properly set state', () => {
      // Arrange
      const error = 'error'
      const state = {
        ...initialState,
        loading: false,
        error,
      }

      // Act
      const nextState = reducer(initialState, getPipelineFailure(error))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        rdi: {
          pipeline: nextState,
        }
      })
      expect(rdiPipelineSelector(rootState)).toEqual(state)
    })
  })

  describe('deployPipeline', () => {
    it('should set loading = true', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: true,
      }

      // Act
      const nextState = reducer(initialState, deployPipeline())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        rdi: {
          pipeline: nextState,
        }
      })
      expect(rdiPipelineSelector(rootState)).toEqual(state)
    })
  })

  describe('deployPipelineSuccess', () => {
    it('should set loading = false', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: false,
      }

      // Act
      const nextState = reducer(initialState, deployPipelineSuccess())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        rdi: {
          pipeline: nextState,
        }
      })
      expect(rdiPipelineSelector(rootState)).toEqual(state)
    })
  })

  describe('deployPipelineFailure', () => {
    it('should set loading = false', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: false,
      }

      // Act
      const nextState = reducer(initialState, deployPipelineFailure())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        rdi: {
          pipeline: nextState,
        }
      })
      expect(rdiPipelineSelector(rootState)).toEqual(state)
    })
  })

  // thunks
  describe('thunks', () => {
    describe('fetchRdiPipeline', () => {
      it('succeed to fetch data', async () => {
        const data = { config: 'string', jobs: [] }
        const responsePayload = { data, status: 200 }

        apiService.get = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(
          fetchRdiPipeline('123')
        )

        // Assert
        const expectedActions = [
          getPipeline(),
          getPipelineSuccess(data),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })

      it('failed to fetch data', async () => {
        const errorMessage = 'Something was wrong!'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.get = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await store.dispatch<any>(
          fetchRdiPipeline('123')
        )

        // Assert
        const expectedActions = [
          getPipeline(),
          addErrorNotification(responsePayload as AxiosError),
          getPipelineFailure(errorMessage)
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('deployPipelineAction', () => {
      it('succeed to post data', async () => {
        const mockData = { config: 'string', jobs: [] }
        const responsePayload = { status: 200 }

        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(
          deployPipelineAction('123', mockData)
        )

        // Assert
        const expectedActions = [
          deployPipeline(),
          deployPipelineSuccess(),
          addInfiniteNotification(INFINITE_MESSAGES.SUCCESS_DEPLOY_PIPELINE()),
        ]

        expect(clearStoreActions(store.getActions())).toEqual(clearStoreActions(expectedActions))
      })

      it('failed to post data', async () => {
        const mockData = { config: 'string', jobs: [] }
        const errorMessage = 'Something was wrong!'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.post = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await store.dispatch<any>(
          deployPipelineAction('123', mockData)
        )

        // Assert
        const expectedActions = [
          deployPipeline(),
          addErrorNotification(responsePayload as AxiosError),
          deployPipelineFailure()
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })
  })
})
