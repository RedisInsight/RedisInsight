import { cloneDeep } from 'lodash'
import { AxiosError } from 'axios'

import { cleanup, clearStoreActions, initialStateDefault, mockedStore } from 'uiSrc/utils/test-utils'
import { OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { apiService } from 'uiSrc/services'
import { addErrorNotification, addInfiniteNotification, removeInfiniteNotification } from 'uiSrc/slices/app/notifications'
import { INFINITE_MESSAGES, InfiniteMessagesIds } from 'uiSrc/components/notifications/components'
import { CloudJobStatus, CloudJobName } from 'uiSrc/electron/constants'
import reducer, {
  initialState,
  setSignInDialogState,
  oauthCloudSelector,
  signIn,
  signInSuccess,
  signInFailure,
  getUserInfo,
  getUserInfoSuccess,
  getUserInfoFailure,
  fetchUserInfo,
  addFreeDbFailure,
  addFreeDbSuccess,
  addFreeDb,
  createFreeDbJob,
  setSelectAccountDialogState,
  createFreeDbSuccess,
  activateAccount,
  setJob,
  fetchPlans,
  getPlans,
  getPlansSuccess,
  getPlansFailure,
  setIsOpenSelectPlanDialog,
  showOAuthProgress,
} from '../../oauth/cloud'

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('oauth cloud slice', () => {
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

  describe('signIn', () => {
    it('should properly set loading = true', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: true,
      }

      // Act
      const nextState = reducer(initialState, signIn())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        oauth: {
          cloud: nextState
        }
      })
      expect(oauthCloudSelector(rootState)).toEqual(state)
    })
  })

  describe('signInSuccess', () => {
    it('should properly set the state', () => {
      // Arrange
      const data = 'message'
      const state = {
        ...initialState,
        message: data,
        loading: false,
      }

      // Act
      const nextState = reducer(initialState, signInSuccess(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        oauth: {
          cloud: nextState
        }
      })
      expect(oauthCloudSelector(rootState)).toEqual(state)
    })
  })

  describe('signInFailure', () => {
    it('should properly set the error', () => {
      // Arrange
      const data = 'some error'
      const state = {
        ...initialState,
        loading: false,
        error: data,
      }

      // Act
      const nextState = reducer(initialState, signInFailure(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        oauth: {
          cloud: nextState
        }
      })
      expect(oauthCloudSelector(rootState)).toEqual(state)
    })
  })

  describe('getUserInfo', () => {
    it('should properly set loading = true', () => {
      // Arrange
      const state = {
        ...initialState,
        user: {
          ...initialState.user,
          loading: true,
        }
      }

      // Act
      const nextState = reducer(initialState, getUserInfo())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        oauth: {
          cloud: nextState
        }
      })
      expect(oauthCloudSelector(rootState)).toEqual(state)
    })
  })

  describe('getUserInfoSuccess', () => {
    it('should properly set the state with fetched data', () => {
      const data = { id: 12 }
      // Arrange
      const state = {
        ...initialState,
        user: {
          ...initialState.user,
          loading: false,
          data,
        }
      }

      // Act
      const nextState = reducer(initialState, getUserInfoSuccess(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        oauth: {
          cloud: nextState
        }
      })
      expect(oauthCloudSelector(rootState)).toEqual(state)
    })
  })

  describe('getUserInfoFailure', () => {
    it('should properly set the error', () => {
      // Arrange
      const data = 'some error'
      const state = {
        ...initialState,
        user: {
          ...initialState.user,
          loading: false,
          error: data,
        }
      }

      // Act
      const nextState = reducer(initialState, getUserInfoFailure(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        oauth: {
          cloud: nextState
        }
      })
      expect(oauthCloudSelector(rootState)).toEqual(state)
    })
  })

  describe('addFreeDb', () => {
    it('should properly set loading = true', () => {
      // Arrange
      const state = {
        ...initialState,
        user: {
          ...initialState.user,
          freeDb: {
            ...initialState.user.freeDb,
            loading: true,
          }
        }
      }

      // Act
      const nextState = reducer(initialState, addFreeDb())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        oauth: {
          cloud: nextState
        }
      })
      expect(oauthCloudSelector(rootState)).toEqual(state)
    })
  })

  describe('addFreeDbSuccess', () => {
    it('should properly set the state with fetched data', () => {
      const data = { host: 'localhost', port: 6379, id: 'id', modules: [], version: '1' }
      // Arrange
      const state = {
        ...initialState,
        user: {
          ...initialState.user,
          freeDb: {
            ...initialState.user.freeDb,
            data,
            loading: false,
          }
        }
      }

      // Act
      const nextState = reducer(initialState, addFreeDbSuccess(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        oauth: {
          cloud: nextState
        }
      })
      expect(oauthCloudSelector(rootState)).toEqual(state)
    })
  })

  describe('addFreeDbFailure', () => {
    it('should properly set the error', () => {
      // Arrange
      const data = 'some error'
      const state = {
        ...initialState,
        user: {
          ...initialState.user,
          freeDb: {
            ...initialState.user.freeDb,
            loading: false,
            error: data,
          }
        }
      }

      // Act
      const nextState = reducer(initialState, addFreeDbFailure(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        oauth: {
          cloud: nextState
        }
      })
      expect(oauthCloudSelector(rootState)).toEqual(state)
    })
  })

  describe('setSelectAccountDialogState', () => {
    it('should properly set the state', () => {
      // Arrange
      const data = true
      const state = {
        ...initialState,
        isOpenSelectAccountDialog: true
      }

      // Act
      const nextState = reducer(initialState, setSelectAccountDialogState(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        oauth: {
          cloud: nextState
        }
      })
      expect(oauthCloudSelector(rootState)).toEqual(state)
    })
  })

  describe('setIsOpenSelectPlanDialog', () => {
    it('should properly set the state', () => {
      // Arrange
      const data = true
      const state = {
        ...initialState,
        plan: {
          ...initialState.plan,
          isOpenDialog: true
        }
      }

      // Act
      const nextState = reducer(initialState, setIsOpenSelectPlanDialog(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        oauth: {
          cloud: nextState
        }
      })
      expect(oauthCloudSelector(rootState)).toEqual(state)
    })
  })

  describe('getPlans', () => {
    it('should properly set the state', () => {
      // Arrange
      const state = {
        ...initialState,
        plan: {
          ...initialState.plan,
          loading: true
        }
      }

      // Act
      const nextState = reducer(initialState, getPlans())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        oauth: {
          cloud: nextState
        }
      })
      expect(oauthCloudSelector(rootState)).toEqual(state)
    })
  })

  describe('getPlansSuccess', () => {
    it('should properly set the state', () => {
      // Arrange
      const data = [{
        id: 12148,
        type: 'fixed',
        name: 'Cache 30MB',
        provider: 'AWS',
        region: 'eu-west-1',
        price: 0,
        details: {
          countryName: 'Poland',
          cityName: 'Warsaw',
          id: 12148,
          region: 'eu-west-1',
        }
      }]
      const state = {
        ...initialState,
        plan: {
          ...initialState.plan,
          loading: false,
          data,
        }
      }

      // Act
      const nextState = reducer(initialState, getPlansSuccess(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        oauth: {
          cloud: nextState
        }
      })
      expect(oauthCloudSelector(rootState)).toEqual(state)
    })
  })

  describe('getPlansFailure', () => {
    it('should properly set the state', () => {
      // Arrange
      const state = {
        ...initialState,
        plan: {
          ...initialState.plan,
          loading: false,
        }
      }

      // Act
      const nextState = reducer(initialState, getPlansFailure())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        oauth: {
          cloud: nextState
        }
      })
      expect(oauthCloudSelector(rootState)).toEqual(state)
    })
  })

  describe('setSignInDialogState', () => {
    it('should properly set the source=SignInDialogSource.BrowserSearch and isOpenSignInDialog=true', () => {
      // Arrange
      const state = {
        ...initialState,
        isOpenSignInDialog: true,
        source: OAuthSocialSource.BrowserSearch,
      }

      // Act
      const nextState = reducer(initialState, setSignInDialogState(OAuthSocialSource.BrowserSearch))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        oauth: { cloud: nextState },
      })
      expect(oauthCloudSelector(rootState)).toEqual(state)
    })
    it('should properly set the isOpenSignInDialog=false if source=null', () => {
      // Arrange
      const prevInitialState = {
        ...initialState,
        isOpenSignInDialog: true,
        source: OAuthSocialSource.BrowserSearch,
      }
      const state = {
        ...initialState,
        isOpenSignInDialog: false,
        source: null,
      }

      // Act
      const nextState = reducer(prevInitialState, setSignInDialogState(null))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        oauth: { cloud: nextState },
      })
      expect(oauthCloudSelector(rootState)).toEqual(state)
    })
  })

  describe('thunks', () => {
    describe('fetchUserInfo', () => {
      it('call both fetchUserInfo and getUserInfoSuccess when fetch is successed', async () => {
      // Arrange
        const data = { id: 123123 }
        const responsePayload = { data, status: 200 }

        apiService.get = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchUserInfo())

        // Assert
        const expectedActions = [
          getUserInfo(),
          getUserInfoSuccess(responsePayload.data),
          setSignInDialogState(null),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
      it('call setSelectAccountDialogState and setSignInDialogState when fetch is successed and accounts > 1', async () => {
      // Arrange
        const data = { id: 123123, accounts: [{}, {}] }
        const responsePayload = { data, status: 200 }

        apiService.get = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchUserInfo())

        // Assert
        const expectedActions = [
          getUserInfo(),
          setSelectAccountDialogState(true),
          removeInfiniteNotification(InfiniteMessagesIds.oAuthProgress),
          getUserInfoSuccess(responsePayload.data),
          setSignInDialogState(null),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })

      it('call both fetchAccountInfo and getUserInfoFailure when fetch is fail', async () => {
      // Arrange
        const errorMessage = 'Could not connect to aoeu:123, please check the connection details.'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.get = jest.fn().mockRejectedValueOnce(responsePayload)

        // Act
        await store.dispatch<any>(fetchUserInfo())

        // Assert
        const expectedActions = [
          getUserInfo(),
          addErrorNotification(responsePayload as AxiosError),
          getUserInfoFailure(responsePayload.response.data.message),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('createFreeDb', () => {
      it('call both addFreeDb and setJob when post is successed', async () => {
      // Arrange
        const data = { id: '123123', name: CloudJobName.CreateFreeDatabase, status: CloudJobStatus.Running }
        const responsePayload = { data, status: 200 }

        apiService.post = jest.fn().mockResolvedValue(responsePayload)
        apiService.get = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(createFreeDbJob())

        // Assert
        const expectedActions = [
          addFreeDb(),
          setJob(data),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })

      it('call both fetchAccountInfo and addFreeDbFailure when post is fail', async () => {
      // Arrange
        const errorMessage = 'Could not connect to aoeu:123, please check the connection details.'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.post = jest.fn().mockRejectedValueOnce(responsePayload)

        // Act
        await store.dispatch<any>(createFreeDbJob())

        // Assert
        const expectedActions = [
          addFreeDb(),
          addErrorNotification(responsePayload as AxiosError),
          addFreeDbFailure(responsePayload.response.data.message),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('activateAccount', () => {
      it('call both getUserInfo and getUserInfoSuccess when put is successed', async () => {
      // Arrange
        const data = {
          id: 3,
          accounts: [
            { id: 3, name: 'name' },
            { id: 4, name: 'name' },
          ]
        }
        const responseAccountPayload = { data, status: 200 }

        apiService.put = jest.fn().mockResolvedValue(responseAccountPayload)

        // Act
        await store.dispatch<any>(activateAccount('123'))

        // Assert
        const expectedActions = [
          getUserInfo(),
          getUserInfoSuccess(data),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })

      it('call both getUserInfo and getUserInfoFailure when put is fail', async () => {
      // Arrange
        const errorMessage = 'Could not connect to aoeu:123, please check the connection details.'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.put = jest.fn().mockRejectedValueOnce(responsePayload)

        // Act
        await store.dispatch<any>(activateAccount('3'))

        // Assert
        const expectedActions = [
          getUserInfo(),
          addErrorNotification(responsePayload as AxiosError),
          getUserInfoFailure(responsePayload.response.data.message),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('createFreeDbSuccess', () => {
      it('should call proper actions without error', async () => {
      // Arrange
        const id = '123'
        const onConnect = () => {}

        // Act
        await store.dispatch<any>(createFreeDbSuccess(id, {}))

        // Assert
        const expectedActions = [
          showOAuthProgress(true),
          removeInfiniteNotification(InfiniteMessagesIds.oAuthProgress),
          addInfiniteNotification(INFINITE_MESSAGES.SUCCESS_CREATE_DB(onConnect)),
          setSelectAccountDialogState(false),
        ]
        expect(clearStoreActions(store.getActions())).toEqual(clearStoreActions(expectedActions))
      })
    })

    describe('fetchPlans', () => {
      it('call both fetchPlans and getPlansSuccess when fetch is successed', async () => {
      // Arrange
        const data = [{
          id: 12148,
          type: 'fixed',
          name: 'Cache 30MB',
          provider: 'AWS',
          region: 'eu-west-1',
          price: 0,
          details: {
            countryName: 'Poland',
            cityName: 'Warsaw',
            id: 12148,
            region: 'eu-west-1',
          }
        }]
        const responsePayload = { data, status: 200 }

        apiService.get = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchPlans())

        // Assert
        const expectedActions = [
          getPlans(),
          getPlansSuccess(responsePayload.data),
          setIsOpenSelectPlanDialog(true),
          setSignInDialogState(null),
          setSelectAccountDialogState(false),
          removeInfiniteNotification(InfiniteMessagesIds.oAuthProgress)
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
      it('call setIsOpenSelectPlanDialog and setSignInDialogState when fetch is successed and accounts > 1', async () => {
      // Arrange
        const data = [{
          id: 12148,
          type: 'fixed',
          name: 'Cache 30MB',
          provider: 'AWS',
          region: 'eu-west-1',
          price: 0,
          details: {
            countryName: 'Poland',
            cityName: 'Warsaw',
            id: 12148,
            region: 'eu-west-1',
          }
        }]
        const responsePayload = { data, status: 200 }

        apiService.get = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchPlans())

        // Assert
        const expectedActions = [
          getPlans(),
          getPlansSuccess(responsePayload.data),
          setIsOpenSelectPlanDialog(true),
          setSignInDialogState(null),
          setSelectAccountDialogState(false),
          removeInfiniteNotification(InfiniteMessagesIds.oAuthProgress),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })

      it('call both getPlans and getPlansFailure when fetch is fail', async () => {
      // Arrange
        const errorMessage = 'Could not connect to aoeu:123, please check the connection details.'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.get = jest.fn().mockRejectedValueOnce(responsePayload)

        // Act
        await store.dispatch<any>(fetchPlans())

        // Assert
        const expectedActions = [
          getPlans(),
          addErrorNotification(responsePayload as AxiosError),
          getPlansFailure(),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
    })
  })
})
