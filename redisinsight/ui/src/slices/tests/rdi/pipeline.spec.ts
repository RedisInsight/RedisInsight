import { cloneDeep } from 'lodash'
import { AxiosError } from 'axios'
import { cleanup, initialStateDefault, mockedStore } from 'uiSrc/utils/test-utils'
import reducer, {
  initialState,
  getPipeline,
  getPipelineSuccess,
  getPipelineFailure,
  fetchRdiPipeline,
  rdiSelector,
} from 'uiSrc/slices/rdi/pipeline'
import { apiService } from 'uiSrc/services'
import { addErrorNotification } from 'uiSrc/slices/app/notifications'

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
      const result = reducer(undefined, {})

      // Assert
      expect(result).toEqual(nextState)
    })
  })

  describe('rdiSelector', () => {
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
        rdi: nextState,
      })
      expect(rdiSelector(rootState)).toEqual(state)
    })
  })

  describe('getPipelineSuccess', () => {
    it('should properly set state', () => {
      // Arrange
      const pipeline = { config: 'string', jobs: [] }
      const state = {
        ...initialState,
        data: pipeline,
      }

      // Act
      const nextState = reducer(initialState, getPipelineSuccess(pipeline))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        rdi: nextState,
      })
      expect(rdiSelector(rootState)).toEqual(state)
    })
  })

  describe('getPipelineFailure', () => {
    it('should properly set state', () => {
      // Arrange
      const error = 'error'
      const state = {
        ...initialState,
        error,
      }

      // Act
      const nextState = reducer(initialState, getPipelineFailure(error))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        rdi: nextState,
      })
      expect(rdiSelector(rootState)).toEqual(state)
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
  })
})
