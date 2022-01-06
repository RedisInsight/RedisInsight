/* eslint-disable sonarjs/no-duplicate-string */
import { cloneDeep } from 'lodash'
import MockedSocket from 'socket.io-mock'
import { cleanup, mockedStore, initialStateDefault } from 'uiSrc/utils/test-utils'
import reducer, {
  initialState,
  resetMonitorItems,
  monitorSelector,
  toggleMonitor,
  showMonitor,
  toggleHideMonitor,
  toggleRunMonitor,
  setSocket,
  concatMonitorItems,
  MONITOR_ITEMS_MAX_COUNT,
} from '../../cli/monitor'

let store: typeof mockedStore
let socket: typeof MockedSocket
beforeEach(() => {
  cleanup()
  socket = new MockedSocket()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('monitor slice', () => {
  describe('toggleMonitor', () => {
    it('default state.isShowMonitor should be falsy', () => {
      // Arrange
      const state: typeof initialState = {
        ...initialState,
        isShowMonitor: false,
        isMinimizedMonitor: false,
      }

      expect(monitorSelector(initialStateDefault)).toEqual(state)
    })

    it('should properly set isShowMonitor = true', () => {
      // Arrange
      const state: typeof initialState = {
        ...initialState,
        isShowMonitor: true,
        isMinimizedMonitor: true,
      }

      // Act
      const nextState = reducer(initialState, toggleMonitor())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        cli: {
          monitor: nextState,
        },
      })
      expect(monitorSelector(rootState)).toEqual(state)
    })
  })

  describe('showMonitor', () => {
    it('should properly set !isShowMonitor', () => {
      // Arrange
      const state: typeof initialState = {
        ...initialState,
        isShowMonitor: true,
      }

      // Act
      const nextState = reducer(initialState, showMonitor())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        cli: {
          monitor: nextState,
        },
      })
      expect(monitorSelector(rootState)).toEqual(state)
    })
  })

  describe('toggleHideMonitor', () => {
    it('should properly set !isShowMonitor', () => {
      // Arrange
      const state: typeof initialState = {
        ...initialState,
        isMinimizedMonitor: true,
      }

      // Act
      const nextState = reducer(initialState, toggleHideMonitor())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        cli: {
          monitor: nextState,
        },
      })
      expect(monitorSelector(rootState)).toEqual(state)
    })
  })

  describe('toggleRunMonitor', () => {
    it('should properly set !isRunning', () => {
      // Arrange
      const state: typeof initialState = {
        ...initialState,
        isRunning: true,
      }

      // Act
      const nextState = reducer(initialState, toggleRunMonitor())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        cli: {
          monitor: nextState,
        },
      })
      expect(monitorSelector(rootState)).toEqual(state)
    })
  })

  describe('setSocket', () => {
    it('should properly set setSocket = mockedSocket', () => {
      // Arrange
      const state: typeof initialState = {
        ...initialState,
        socket,
        isStarted: true
      }

      // Act
      const nextState = reducer(initialState, setSocket(socket))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        cli: {
          monitor: nextState,
        },
      })
      expect(monitorSelector(rootState)).toEqual(state)
    })
  })

  describe('concatMonitorItems', () => {
    it('should properly set payload to items', () => {
      const payload = [{
        time: '1',
        args: ['monitor'],
        source: 'source',
        database: 0,
        shardOptions: { host: '127.0.0.1', port: 6379 }
      },
      {
        time: '2',
        args: ['get'],
        source: 'source',
        database: 0,
        shardOptions: { host: '127.0.0.1', port: 6379 }
      }]

      // Arrange
      const state: typeof initialState = {
        ...initialState,
        items: payload
      }

      // Act
      const nextState = reducer(initialState, concatMonitorItems(payload))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        cli: {
          monitor: nextState,
        },
      })
      expect(monitorSelector(rootState)).toEqual(state)
    })

    it('should properly set items no more than MONITOR_ITEMS_MAX_COUNT', () => {
      const payload = new Array(2000)

      // Arrange
      const state: typeof initialState = {
        ...initialState,
        items: new Array(MONITOR_ITEMS_MAX_COUNT)
      }

      // Act
      const nextState = reducer(initialState, concatMonitorItems(payload))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        cli: {
          monitor: nextState,
        },
      })
      expect(monitorSelector(rootState)).toEqual(state)
    })
  })

  describe('resetMonitorItems', () => {
    it('should properly set isShowMonitor = false', () => {
      // Arrange
      const state: typeof initialState = {
        ...initialState,
        isShowMonitor: false,
      }

      // Act
      const nextState = reducer(initialState, resetMonitorItems())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        cli: {
          monitor: nextState,
        },
      })
      expect(monitorSelector(rootState)).toEqual(state)
    })
  })
})
