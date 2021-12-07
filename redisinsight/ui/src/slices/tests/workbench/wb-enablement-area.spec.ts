import { cloneDeep } from 'lodash'
import { cleanup, initialStateDefault, mockedStore, } from 'uiSrc/utils/test-utils'
import { IEnablementAreaItem } from 'uiSrc/slices/interfaces'
import { MOCK_ENABLEMENT_AREA_ITEMS } from 'uiSrc/constants'
import { resourcesService } from 'uiSrc/services'

import reducer, {
  initialState,
  workbenchEnablementAreaSelector,
  getWBEnablementArea,
  getWBEnablementAreaFailure,
  getWBEnablementAreaSuccess,
  fetchEnablementArea,
  defaultItems,
} from '../../workbench/wb-enablement-area'

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('slices', () => {
  describe('reducer, actions and selectors', () => {
    it('should return the initial state on first run', () => {
      // Arrange
      const nextState = initialState

      // Act
      const result = reducer(undefined, {})

      // Assert
      expect(result).toEqual(nextState)
    })
  })

  describe('getWBEnablementArea', () => {
    it('should properly set loading', () => {
      // Arrange
      const loading = true
      const state = {
        ...initialState,
        loading
      }

      // Act
      const nextState = reducer(initialState, getWBEnablementArea())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        workbench: {
          enablementArea: nextState,
        },
      })

      expect(workbenchEnablementAreaSelector(rootState)).toEqual(state)
    })
  })

  describe('getWBEnablementAreaSuccess', () => {
    it('should properly set state after success', () => {
      // Arrange
      const items: Record<string, IEnablementAreaItem> = MOCK_ENABLEMENT_AREA_ITEMS
      const state = {
        ...initialState,
        items,
      }

      // Act
      const nextState = reducer(initialState, getWBEnablementAreaSuccess(items))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        workbench: {
          enablementArea: nextState,
        },
      })

      expect(workbenchEnablementAreaSelector(rootState)).toEqual(state)
    })
  })

  describe('getWBEnablementAreaFailure', () => {
    it('should properly set error', () => {
      // Arrange
      const error = 'error'
      const state = {
        ...initialState,
        loading: false,
        items: defaultItems,
        error
      }

      // Act
      const nextState = reducer(initialState, getWBEnablementAreaFailure(error))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        workbench: {
          enablementArea: nextState,
        },
      })

      expect(workbenchEnablementAreaSelector(rootState)).toEqual(state)
    })
  })

  // thunks
  describe('fetchEnablementArea', () => {
    it('succeed to fetch enablement area items', async () => {
      // Arrange
      const data = MOCK_ENABLEMENT_AREA_ITEMS
      const responsePayload = { status: 200, data }

      resourcesService.get = jest.fn().mockResolvedValue(responsePayload)

      // Act
      await store.dispatch<any>(fetchEnablementArea(jest.fn()))

      // Assert
      const expectedActions = [
        getWBEnablementArea(),
        getWBEnablementAreaSuccess(data),
      ]

      expect(mockedStore.getActions()).toEqual(expectedActions)
    })

    it('failed to fetch enablement area items', async () => {
      // Arrange
      const errorMessage = 'Something was wrong!'
      const responsePayload = {
        response: {
          status: 500,
          data: { message: errorMessage },
        },
      }
      resourcesService.get = jest.fn().mockRejectedValue(responsePayload)

      // Act
      await store.dispatch<any>(fetchEnablementArea())

      // Assert
      const expectedActions = [
        getWBEnablementArea(),
        getWBEnablementAreaFailure(errorMessage),
      ]

      expect(mockedStore.getActions()).toEqual(expectedActions)
    })
  })
})
