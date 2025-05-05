import thunk from 'redux-thunk'
import configureStore from 'redux-mock-store'

const mockStore = configureStore([thunk])

describe('setReJSONDataAction', () => {
  let store: any
  let sendEventTelemetryMock: jest.Mock
  let setReJSONDataAction: any
  let apiService: any

  beforeEach(async () => {
    jest.resetModules()

    sendEventTelemetryMock = jest.fn()

    jest.doMock('uiSrc/telemetry', () => {
      const actual = jest.requireActual('uiSrc/telemetry')
      return {
        ...actual,
        sendEventTelemetry: sendEventTelemetryMock,
        getBasedOnViewTypeEvent: jest.fn(() => 'mocked_event'),
        getJsonPathLevel: jest.fn(() => 42),
      }
    })

    jest.doMock('uiSrc/slices/browser/keys', () => {
      const actual = jest.requireActual('uiSrc/slices/browser/keys')
      return {
        ...actual,
        refreshKeyInfoAction: () => ({ type: 'DUMMY_REFRESH' }),
      }
    })

    const rejson = await import('uiSrc/slices/browser/rejson')
    setReJSONDataAction = rejson.setReJSONDataAction
    apiService = (await import('uiSrc/services')).apiService

    store = mockStore({
      browser: {
        rejson: { editorType: 'Default' },
        keys: { viewType: 'Browser' },
      },
      app: {
        info: { encoding: 'utf8' },
      },
      connections: {
        instances: {
          connectedInstance: {
            id: 'instance-id',
          },
        },
      },
    })

    apiService.patch = jest.fn().mockResolvedValue({ status: 200 })
    apiService.post = jest.fn().mockResolvedValue({ status: 200, data: {} })

    jest.clearAllMocks()
  })

  it('should call sendEventTelemetry with correct args', async () => {
    await store.dispatch(setReJSONDataAction('key', '$', '{}', true, 100))

    expect(sendEventTelemetryMock).toHaveBeenCalledWith({
      event: 'mocked_event',
      eventData: {
        databaseId: 'instance-id',
        keyLevel: 42,
      },
    })
  })
})
