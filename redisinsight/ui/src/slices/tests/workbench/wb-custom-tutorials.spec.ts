import { cloneDeep } from 'lodash'
import { cleanup, initialStateDefault, mockedStore, } from 'uiSrc/utils/test-utils'
import { IEnablementAreaItem } from 'uiSrc/slices/interfaces'
import { MOCK_TUTORIALS_ITEMS } from 'uiSrc/constants'
import { apiService } from 'uiSrc/services'

import reducer, {
  initialState,
  getWBCustomTutorials,
  getWBCustomTutorialsSuccess,
  getWBCustomTutorialsFailure,
  uploadWbCustomTutorial,
  uploadWBCustomTutorialSuccess,
  uploadWBCustomTutorialFailure,
  deleteWbCustomTutorial,
  deleteWBCustomTutorialSuccess,
  deleteWBCustomTutorialFailure,
  uploadCustomTutorial,
  fetchCustomTutorials,
  deleteCustomTutorial,
  workbenchCustomTutorialsSelector,
  defaultItems,
} from '../../workbench/wb-custom-tutorials'

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

  describe('getWBCustomTutorials', () => {
    it('should properly set loading', () => {
      // Arrange
      const loading = true
      const state = {
        ...initialState,
        loading
      }

      // Act
      const nextState = reducer(initialState, getWBCustomTutorials())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        workbench: {
          customTutorials: nextState,
        },
      })

      expect(workbenchCustomTutorialsSelector(rootState)).toEqual(state)
    })
  })

  describe('getWBCustomTutorialsSuccess', () => {
    it('should properly set state after success', () => {
      // Arrange
      const items: IEnablementAreaItem[] = MOCK_TUTORIALS_ITEMS
      const state = {
        ...initialState,
        items,
      }

      // Act
      const nextState = reducer(initialState, getWBCustomTutorialsSuccess(items))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        workbench: {
          customTutorials: nextState,
        },
      })

      expect(workbenchCustomTutorialsSelector(rootState)).toEqual(state)
    })
  })

  describe('getWBCustomTutorialsFailure', () => {
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
      const nextState = reducer(initialState, getWBCustomTutorialsFailure(error))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        workbench: {
          customTutorials: nextState,
        },
      })

      expect(workbenchCustomTutorialsSelector(rootState)).toEqual(state)
    })
  })

  // thunks

  describe('fetchCustomTutorials', () => {
    it('succeed to fetch tutorials items', async () => {
      // Arrange
      const data = MOCK_TUTORIALS_ITEMS
      const responsePayload = { status: 200, data }

      apiService.get = jest.fn().mockResolvedValue(responsePayload)

      // Act
      await store.dispatch<any>(fetchCustomTutorials(jest.fn()))

      // Assert
      const expectedActions = [
        getWBCustomTutorials(),
        getWBCustomTutorialsSuccess(data),
      ]

      expect(mockedStore.getActions()).toEqual(expectedActions)
    })

    it('failed to fetch tutorials items', async () => {
      // Arrange
      const errorMessage = 'Something was wrong!'
      const responsePayload = {
        response: {
          status: 500,
          data: { message: errorMessage },
        },
      }
      apiService.get = jest.fn().mockRejectedValue(responsePayload)

      // Act
      await store.dispatch<any>(fetchCustomTutorials())

      // Assert
      const expectedActions = [
        getWBCustomTutorials(),
        getWBCustomTutorialsFailure(errorMessage),
      ]

      expect(mockedStore.getActions()).toEqual(expectedActions)
    })
  })
})
