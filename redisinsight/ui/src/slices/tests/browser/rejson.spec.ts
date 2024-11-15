import { AxiosError } from 'axios'
import { cloneDeep } from 'lodash'
import { apiService } from 'uiSrc/services'
import {
  cleanup,
  initialStateDefault,
  mockedStore,
  mockStore,
} from 'uiSrc/utils/test-utils'
import successMessages from 'uiSrc/components/notifications/success-messages'
import { GetRejsonRlResponseDto } from 'apiSrc/modules/browser/rejson-rl/dto'
import reducer, {
  initialState,
  loadRejsonBranch,
  loadRejsonBranchSuccess,
  loadRejsonBranchFailure,
  appendReJSONArrayItem,
  appendReJSONArrayItemSuccess,
  appendReJSONArrayItemFailure,
  setReJSONData,
  setReJSONDataSuccess,
  setReJSONDataFailure,
  removeRejsonKey,
  removeRejsonKeySuccess,
  removeRejsonKeyFailure,
  rejsonSelector,
  fetchReJSON,
  fetchVisualisationResults,
  setReJSONDataAction,
  appendReJSONArrayItemAction,
  removeReJSONKeyAction,
} from '../../browser/rejson'
import { addErrorNotification, addMessageNotification } from '../../app/notifications'
import { refreshKeyInfo } from '../../browser/keys'


jest.mock('uiSrc/services', () => ({
  ...jest.requireActual('uiSrc/services'),
}))

let store: typeof mockedStore
let storeWithSelectedKey: typeof mockedStore
let defaultData: GetRejsonRlResponseDto

const key = 'key'
const path = '.'

beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()

  defaultData = {
    downloaded: false,
    path: '.',
    data: [
      { key: 'glossary', path: "['glossary']", cardinality: 2, type: 'object' },
    ],
    type: 'object',
  }

  const rootStateWithSelectedKey = Object.assign(initialStateDefault, {
    browser: {
      keys: {
        selectedKey: {
          data: {
            name: 'selectedKey',
          },
        },
      },
    },
  })

  storeWithSelectedKey = mockStore(rootStateWithSelectedKey)
})

describe('rejson slice', () => {
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

  describe('loadRejsonBranch', () => {
    it('should properly set loading = true', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: true,
      }

      // Act
      const nextState = reducer(initialState, loadRejsonBranch())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: {
          rejson: nextState,
        },
      })
      expect(rejsonSelector(rootState)).toEqual(state)
    })
  })

  describe('loadRejsonBranchSuccess', () => {
    it('should properly set the state with fetched data', () => {
      // Arrange

      const state = {
        ...initialState,
        loading: false,
        data: defaultData,
      }

      // Act
      const nextState = reducer(
        initialState,
        loadRejsonBranchSuccess(defaultData)
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: {
          rejson: nextState,
        },
      })
      expect(rejsonSelector(rootState)).toEqual(state)
    })

    it('should properly set the state with empty data', () => {
      // Arrange
      const data: any = []

      const state = {
        ...initialState,
        loading: false,
        data,
      }

      // Act
      const nextState = reducer(initialState, loadRejsonBranchSuccess(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: {
          rejson: nextState,
        },
      })
      expect(rejsonSelector(rootState)).toEqual(state)
    })
  })

  describe('loadRejsonBranchFailure', () => {
    it('should properly set the error', () => {
      // Arrange
      const data = 'some error'
      const state = {
        ...initialState,
        loading: false,
        error: data,
      }

      // Act
      const nextState = reducer(initialState, loadRejsonBranchFailure(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: {
          rejson: nextState,
        },
      })
      expect(rejsonSelector(rootState)).toEqual(state)
    })
  })

  describe('appendReJSONArrayItem', () => {
    it('should properly set loading = true', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: true,
      }

      // Act
      const nextState = reducer(initialState, appendReJSONArrayItem())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: {
          rejson: nextState,
        },
      })
      expect(rejsonSelector(rootState)).toEqual(state)
    })
  })

  describe('appendReJSONArrayItemSuccess', () => {
    it('should properly set the state after append', () => {
      const state = {
        ...initialState,
        loading: false
      }

      // Act
      const nextState = reducer(initialState, appendReJSONArrayItemSuccess())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: {
          rejson: nextState,
        },
      })
      expect(rejsonSelector(rootState)).toEqual(state)
    })
  })

  describe('appendReJSONArrayItemFailure', () => {
    it('should properly set the error', () => {
      // Arrange
      const data = 'some error'
      const state = {
        ...initialState,
        loading: false,
        error: data,
      }

      // Act
      const nextState = reducer(initialState, appendReJSONArrayItemFailure(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: {
          rejson: nextState,
        },
      })
      expect(rejsonSelector(rootState)).toEqual(state)
    })
  })

  describe('setReJSONData', () => {
    it('should properly set loading = true', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: true,
      }

      // Act
      const nextState = reducer(initialState, setReJSONData())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: {
          rejson: nextState,
        },
      })
      expect(rejsonSelector(rootState)).toEqual(state)
    })
  })

  describe('setReJSONDataSuccess', () => {
    it('should properly set the state after append', () => {
      const state = {
        ...initialState,
        loading: false
      }

      // Act
      const nextState = reducer(initialState, setReJSONDataSuccess())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: {
          rejson: nextState,
        },
      })
      expect(rejsonSelector(rootState)).toEqual(state)
    })
  })

  describe('setReJSONDataFailure', () => {
    it('should properly set the error', () => {
      // Arrange
      const data = 'some error'
      const state = {
        ...initialState,
        loading: false,
        error: data,
      }

      // Act
      const nextState = reducer(initialState, setReJSONDataFailure(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: {
          rejson: nextState,
        },
      })
      expect(rejsonSelector(rootState)).toEqual(state)
    })
  })

  describe('removeRejsonKey', () => {
    it('should properly set loading = true', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: true,
      }

      // Act
      const nextState = reducer(initialState, removeRejsonKey())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: {
          rejson: nextState,
        },
      })
      expect(rejsonSelector(rootState)).toEqual(state)
    })
  })

  describe('removeRejsonKeySuccess', () => {
    it('should properly set the state after append', () => {
      const state = {
        ...initialState,
        loading: false
      }

      // Act
      const nextState = reducer(initialState, removeRejsonKeySuccess())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: {
          rejson: nextState,
        },
      })
      expect(rejsonSelector(rootState)).toEqual(state)
    })
  })

  describe('removeRejsonKeyFailure', () => {
    it('should properly set the error', () => {
      // Arrange
      const data = 'some error'
      const state = {
        ...initialState,
        loading: false,
        error: data,
      }

      // Act
      const nextState = reducer(initialState, removeRejsonKeyFailure(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: {
          rejson: nextState,
        },
      })
      expect(rejsonSelector(rootState)).toEqual(state)
    })
  })

  describe('thunks', () => {
    describe('fetchReJSON', () => {
      it('call both fetchReJSON and loadRejsonBranchSuccess when fetch is successed', async () => {
        const responsePayload = { data: defaultData, status: 200 }

        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchReJSON(key, path))

        // Assert
        const expectedActions = [
          loadRejsonBranch(),
          loadRejsonBranchSuccess(responsePayload.data)
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })

      it('call both fetchReJSON and loadRejsonBranchFailure when fetch is fail', async () => {
        // Arrange
        const key = 'key'
        const path = '.'
        const errorMessage = 'Could not connect to aoeu:123, please check the connection details.'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.post = jest.fn().mockRejectedValueOnce(responsePayload)

        // Act
        await store.dispatch<any>(fetchReJSON(key, path))

        // Assert
        const expectedActions = [
          loadRejsonBranch(),
          loadRejsonBranchFailure(responsePayload.response.data.message),
          addErrorNotification(responsePayload as AxiosError),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('setReJSONDataAction', () => {
      it('succeed to fetch set json data', async () => {
        // Arrange
        const key = 'key'
        const path = '.'
        const data = '{}'

        const responsePayload = { status: 200 }

        apiService.patch = jest.fn().mockResolvedValue(responsePayload)

        const responsePayload2 = { data: defaultData, status: 200 }

        apiService.post = jest.fn().mockResolvedValue(responsePayload2)

        // Act
        await store.dispatch<any>(setReJSONDataAction(key, path, data))

        // Assert
        const expectedActions = [
          setReJSONData(),
          setReJSONDataSuccess(),
          loadRejsonBranch(),
          refreshKeyInfo()
        ]
        expect(store.getActions().slice(0, expectedActions.length)).toEqual(expectedActions)
      })

      it('failed to fetch set json data', async () => {
        // Arrange
        const key = 'key'
        const path = '.'
        const errorMessage = 'some error'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.patch = jest.fn().mockRejectedValueOnce(responsePayload)

        // Act
        await store.dispatch<any>(setReJSONDataAction(key, path, '{'))

        // Assert
        const expectedActions = [
          setReJSONData(),
          setReJSONDataFailure(responsePayload.response.data.message),
          addErrorNotification(responsePayload as AxiosError),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('appendReJSONArrayItemAction', () => {
      it('succeed to fetch append array data', async () => {
        // Arrange
        const key = 'key'
        const path = '.'
        const data = '123'

        const responsePayload = { status: 200 }

        apiService.patch = jest.fn().mockResolvedValue(responsePayload)

        const responsePayload2 = { data: defaultData, status: 200 }

        apiService.post = jest.fn().mockResolvedValue(responsePayload2)

        // Act
        await store.dispatch<any>(appendReJSONArrayItemAction(key, path, data))

        // Assert
        const expectedActions = [
          appendReJSONArrayItem(),
          appendReJSONArrayItemSuccess(),
          loadRejsonBranch(),
          refreshKeyInfo()
        ]
        expect(store.getActions().slice(0, expectedActions.length)).toEqual(expectedActions)
      })

      it('failed to fetch append array data', async () => {
        // Arrange
        const key = 'key'
        const path = '.'
        const errorMessage = 'some error'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.patch = jest.fn().mockRejectedValueOnce(responsePayload)

        // Act
        await store.dispatch<any>(appendReJSONArrayItemAction(key, path, '{'))

        // Assert
        const expectedActions = [
          appendReJSONArrayItem(),
          appendReJSONArrayItemFailure(responsePayload.response.data.message),
          addErrorNotification(responsePayload as AxiosError),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('removeReJSONKeyAction', () => {
      it('succeed to fetch remove json key', async () => {
        // Arrange
        const key = 'key'
        const path = '.'
        const jsonKeyName = 'jsonKeyName'

        const responsePayload = { status: 200 }

        apiService.delete = jest.fn().mockResolvedValue(responsePayload)

        const responsePayload2 = { data: defaultData, status: 200 }

        apiService.post = jest.fn().mockResolvedValue(responsePayload2)

        // Act
        await store.dispatch<any>(removeReJSONKeyAction(key, path, jsonKeyName))

        // Assert
        const expectedActions = [
          removeRejsonKey(),
          removeRejsonKeySuccess(),
          loadRejsonBranch(),
          refreshKeyInfo(),
          addMessageNotification(
            successMessages.REMOVED_KEY_VALUE(
              key,
              jsonKeyName,
              'JSON key'
            )
          )
        ]
        expect(store.getActions().slice(0, expectedActions.length)).toEqual(expectedActions)
      })

      it('failed to fetch remove json key', async () => {
        // Arrange
        const key = 'key'
        const path = '.'
        const errorMessage = 'some error'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.delete = jest.fn().mockRejectedValueOnce(responsePayload)

        // Act
        await store.dispatch<any>(removeReJSONKeyAction(key, path))

        // Assert
        const expectedActions = [
          removeRejsonKey(),
          removeRejsonKeyFailure(responsePayload.response.data.message),
          addErrorNotification(responsePayload as AxiosError),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('fetchVisualisationResults', () => {
      it('call both fetchVisualisationResults and loadRejsonBranchSuccess when fetch is successed', async () => {
        // Arrange
        const path = '.'

        const responsePayload = { data: defaultData, status: 200 }

        const expectedResult = defaultData

        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        // Act
        const result = await storeWithSelectedKey.dispatch<any>(
          fetchVisualisationResults(path)
        )

        // Assert
        expect(result).toEqual(expectedResult)
      })
    })

    describe('parse json data with bigints', () => {
      const bigintAsString = '1188950299261208742'
      it('should properly parse BigInt within object', async () => {
        const input = {
          data: `{"value": ${bigintAsString}, "text": "test"}`,
          type: 'object'
        }
        
        const responsePayload = { data: input, status: 200 }
        apiService.post = jest.fn().mockResolvedValue(responsePayload)
        
        await store.dispatch<any>(fetchReJSON(key, path))
        
        const successAction = store.getActions()[1]

        const value = successAction.payload.data.value
        expect(typeof value).toBe('bigint')
        expect(value.toString()).toBe(bigintAsString)
        expect(successAction.payload.data.text).toBe('test')
      })

      it('should properly parse BigInt within array', async () => {
        const input = {
          data: `[${bigintAsString}, "test"]`,
          type: 'array'
        }
        
        const responsePayload = { data: input, status: 200 }
        apiService.post = jest.fn().mockResolvedValue(responsePayload)
        
        await store.dispatch<any>(fetchReJSON(key, path))
        
        const successAction = store.getActions()[1]

        const value = successAction.payload.data[0]
        expect(typeof value).toBe('bigint')
        expect(value.toString()).toBe(bigintAsString)
        expect(successAction.payload.data[1]).toBe('test')
      })

      it('should properly keep BigInt that was a string as a string', async () => {
        const input = {
          data: `["${bigintAsString}", "test"]`,
          type: 'array'
        }
        
        const responsePayload = { data: input, status: 200 }
        apiService.post = jest.fn().mockResolvedValue(responsePayload)
        
        await store.dispatch<any>(fetchReJSON(key, path))
        
        const successAction = store.getActions()[1]

        const value = successAction.payload.data[0]
        expect(typeof value).toBe('string')
        expect(value).toBe(bigintAsString)
        expect(successAction.payload.data[1]).toBe('test')
      })
    })

    describe('fetchVisualisationResults', () => {
      it('should parse string values correctly', async () => {
        const responseData = {
          downloaded: false,
          path: '[0]',
          data: [
            {
              key: 'name',
              path: '[0]["name"]',
              cardinality: 1,
              type: 'string',
              value: '"John"'
            }
          ],
          type: 'object'
        };
  
        apiService.post = jest.fn().mockResolvedValue({ 
          data: responseData, 
          status: 200 
        });
  
        const result = await store.dispatch<any>(fetchVisualisationResults());
        expect(result.data[0].value).toBe('"John"');
      });
  
      it('should parse numbers correctly', async () => {
        const responseData = {
          downloaded: false,
          path: '[0]',
          data: [
            {
              key: 'age',
              path: '[0]["age"]',
              cardinality: 1,
              type: 'integer',
              value: '30'
            }
          ],
          type: 'object'
        };
  
        apiService.post = jest.fn().mockResolvedValue({ 
          data: responseData, 
          status: 200 
        });
  
        const result = await store.dispatch<any>(fetchVisualisationResults());
        expect(result.data[0].value).toBe(30);
      });
  
      it('should handle bigint values', async () => {
        const bigintAsString = '1188950299261208942';
        const responseData = {
          downloaded: false,
          path: '[0]',
          data: [
            {
              key: 'bigNumber',
              path: '[0]["bigNumber"]',
              cardinality: 1,
              type: 'integer',
              value: bigintAsString
            }
          ],
          type: 'object'
        };
  
        apiService.post = jest.fn().mockResolvedValue({ 
          data: responseData, 
          status: 200 
        });
  
        const result = await store.dispatch<any>(fetchVisualisationResults());
        expect(typeof result.data[0].value).toBe('bigint');
        expect(result.data[0].value.toString()).toBe(bigintAsString);
      });
  
      it('should handle error cases', async () => {
        const error = new Error('Test error');
        apiService.post = jest.fn().mockRejectedValue(error);
  
        const result = await store.dispatch<any>(fetchVisualisationResults());
        
        expect(result).toBeNull();
        const actions = store.getActions();
        expect(actions).toHaveLength(2);
        expect(actions[0].type).toBe('rejson/loadRejsonBranchFailure');
      });
    });
  });
})
