import { cloneDeep } from 'lodash'
import { cleanup, initialStateDefault, mockedStore, } from 'uiSrc/utils/test-utils'
import { IEnablementAreaItem } from 'uiSrc/slices/interfaces'
import { MOCK_GUIDES_ITEMS } from 'uiSrc/constants'
import { resourcesService } from 'uiSrc/services'

import reducer, {
  initialState,
  workbenchGuidesSelector,
  getWBGuides,
  getWBGuidesFailure,
  getWBGuidesSuccess,
  fetchGuides,
  defaultItems,
} from '../../workbench/wb-guides'

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

  describe('getWBGuides', () => {
    it('should properly set loading', () => {
      // Arrange
      const loading = true
      const state = {
        ...initialState,
        loading
      }

      // Act
      const nextState = reducer(initialState, getWBGuides())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        workbench: {
          guides: nextState,
        },
      })

      expect(workbenchGuidesSelector(rootState)).toEqual(state)
    })
  })

  describe('getWBGuidesSuccess', () => {
    it('should properly set state after success', () => {
      // Arrange
      const items: IEnablementAreaItem[] = MOCK_GUIDES_ITEMS
      const state = {
        ...initialState,
        items,
      }

      // Act
      const nextState = reducer(initialState, getWBGuidesSuccess(items))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        workbench: {
          guides: nextState,
        },
      })

      expect(workbenchGuidesSelector(rootState)).toEqual(state)
    })
  })

  describe('getWBGuidesFailure', () => {
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
      const nextState = reducer(initialState, getWBGuidesFailure(error))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        workbench: {
          guides: nextState,
        },
      })

      expect(workbenchGuidesSelector(rootState)).toEqual(state)
    })
  })

  // thunks

  describe('fetchGuides', () => {
    it('succeed to fetch guides items', async () => {
      // Arrange
      const data = MOCK_GUIDES_ITEMS
      const responsePayload = { status: 200, data }

      resourcesService.get = jest.fn().mockResolvedValue(responsePayload)

      // Act
      await store.dispatch<any>(fetchGuides(jest.fn()))

      // Assert
      const expectedActions = [
        getWBGuides(),
        getWBGuidesSuccess(data),
      ]

      expect(mockedStore.getActions()).toEqual(expectedActions)
    })

    it('failed to fetch guides items', async () => {
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
      await store.dispatch<any>(fetchGuides())

      // Assert
      const expectedActions = [
        getWBGuides(),
        getWBGuidesFailure(errorMessage),
      ]

      expect(mockedStore.getActions()).toEqual(expectedActions)
    })
  })
})
