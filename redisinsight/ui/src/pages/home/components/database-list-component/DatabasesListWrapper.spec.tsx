import { EuiInMemoryTable } from '@elastic/eui'
import { first } from 'lodash'
import React from 'react'
import { useSelector } from 'react-redux'
import { instance, mock } from 'ts-mockito'

import ItemList, { Props as ItemListProps } from 'uiSrc/components/item-list/ItemList'
import { errorHandlers } from 'uiSrc/mocks/res/responseComposition'
import { mswServer } from 'uiSrc/mocks/server'
import { ConnectionType, Instance, RedisCloudSubscriptionType } from 'uiSrc/slices/interfaces'
import { RootState, store } from 'uiSrc/slices/store'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import { act, fireEvent, render, screen } from 'uiSrc/utils/test-utils'

import DatabasesListWrapper, { Props } from './DatabasesListWrapper'

const mockedProps = mock<Props>()

jest.mock('uiSrc/components/item-list/ItemList', () => ({
  __esModule: true,
  namedExport: jest.fn(),
  default: jest.fn()
}))

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn()
}))

jest.mock('file-saver', () => ({
  saveAs: jest.fn()
}))

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn()
}))

const mockInstances: Instance[] = [
  {
    id: 'e37cc441-a4f2-402c-8bdb-fc2413cbbaff',
    host: 'localhost',
    port: 6379,
    name: 'localhost',
    username: null,
    password: null,
    connectionType: ConnectionType.Standalone,
    nameFromProvider: null,
    new: true,
    modules: [],
    version: null,
    lastConnection: new Date('2021-04-22T09:03:56.917Z'),
    provider: 'provider'
  },
  {
    id: 'a0db1bc8-a353-4c43-a856-b72f4811d2d4',
    host: 'localhost',
    port: 12000,
    name: 'oea123123',
    username: null,
    password: null,
    connectionType: ConnectionType.Standalone,
    nameFromProvider: null,
    tls: true,
    modules: [],
    version: null,
    cloudDetails: {
      cloudId: 1,
      subscriptionType: RedisCloudSubscriptionType.Fixed
    }
  }
]

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  instancesSelector: jest.fn().mockReturnValue({
    loading: false,
    error: '',
    data: mockInstances,
  })
}))

const mockDatabasesList = (props: ItemListProps<Instance>) => {
  const columns = first(props.columnVariations)

  if (!columns) {
    return null
  }

  return (
    <div>
      <button type="button" onClick={() => props.onDelete([mockInstances[1]])} data-testid="onDelete-btn">
        onDelete
      </button>
      <button
        type="button"
        onClick={() => props.onExport([mockInstances[0]], true)}
        data-testid="onExport-btn"
      >
        onExport
      </button>
      <button
        type="button"
        onClick={() =>
          props.onTableChange({
            sort: {
              field: 'name',
              direction: 'asc'
            }
          })}
        data-testid="onTableChange-btn"
      >
        onTableChange
      </button>
      <div className="itemList">
        <EuiInMemoryTable
          isSelectable
          items={mockInstances}
          itemId="id"
          loading={false}
          columns={columns}
          data-testid="table"
        />
      </div>
    </div>
  )
}

describe('DatabasesListWrapper', () => {
  beforeAll(() => {
    (ItemList as jest.Mock).mockImplementation(mockDatabasesList)
  })

  beforeEach(() => {
    const state: RootState = store.getState();
    (useSelector as jest.Mock).mockImplementation((callback: (arg0: RootState) => RootState) =>
      callback({
        ...state,
        analytics: {
          ...state.analytics
        },
        connections: {
          ...state.connections,
          instances: {
            ...state.connections.instances,
            data: mockInstances
          }
        }
      }))
  })

  it('should render', () => {
    expect(render(<DatabasesListWrapper {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should show indicator for a new connection', () => {
    const { queryByTestId } = render(<DatabasesListWrapper {...instance(mockedProps)} />)

    const dbIdWithNewIndicator = mockInstances.find(({ new: newState }) => newState)?.id
    const dbIdWithoutNewIndicator = mockInstances.find(({ new: newState }) => !newState)?.id

    expect(queryByTestId(`database-status-new-${dbIdWithNewIndicator}`)).toBeInTheDocument()
    expect(queryByTestId(`database-status-new-${dbIdWithoutNewIndicator}`)).not.toBeInTheDocument()
  })

  it('should call proper telemetry on success export', async () => {
    const sendEventTelemetryMock = jest.fn();

    (sendEventTelemetry as jest.Mock).mockImplementation(() => sendEventTelemetryMock)
    render(<DatabasesListWrapper {...instance(mockedProps)} />)

    await act(() => {
      fireEvent.click(screen.getByTestId('onExport-btn'))
    })

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.CONFIG_DATABASES_REDIS_EXPORT_SUCCEEDED,
      eventData: {
        numberOfDatabases: 1
      }
    });

    (sendEventTelemetry as jest.Mock).mockRestore()
  })

  it('should call proper telemetry on fail export', async () => {
    mswServer.use(...errorHandlers)
    const sendEventTelemetryMock = jest.fn();

    (sendEventTelemetry as jest.Mock).mockImplementation(() => sendEventTelemetryMock)
    render(<DatabasesListWrapper {...instance(mockedProps)} />)

    await act(() => {
      fireEvent.click(screen.getByTestId('onExport-btn'))
    })

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.CONFIG_DATABASES_REDIS_EXPORT_FAILED,
      eventData: {
        numberOfDatabases: 1
      }
    });

    (sendEventTelemetry as jest.Mock).mockRestore()
  })

  it('should call proper telemetry on delete multiple databases', async () => {
    const sendEventTelemetryMock = jest.fn();

    (sendEventTelemetry as jest.Mock).mockImplementation(() => sendEventTelemetryMock)
    render(<DatabasesListWrapper {...instance(mockedProps)} />)

    await act(() => {
      fireEvent.click(screen.getByTestId('onDelete-btn'))
    })

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.CONFIG_DATABASES_MULTIPLE_DATABASES_DELETE_CLICKED,
      eventData: {
        ids: ['a0db1bc8-a353-4c43-a856-b72f4811d2d4']
      }
    });

    (sendEventTelemetry as jest.Mock).mockRestore()
  })

  it('should show link to cloud console', () => {
    render(<DatabasesListWrapper {...instance(mockedProps)} />)

    expect(screen.queryByTestId(`cloud-link-${mockInstances[0].id}`)).not.toBeInTheDocument()
    expect(screen.getByTestId(`cloud-link-${mockInstances[1].id}`)).toBeInTheDocument()
  })

  it('should call proper telemetry on click cloud console link', () => {
    const sendEventTelemetryMock = jest.fn();

    (sendEventTelemetry as jest.Mock).mockImplementation(() => sendEventTelemetryMock)
    render(<DatabasesListWrapper {...instance(mockedProps)} />)

    fireEvent.click(screen.getByTestId(`cloud-link-${mockInstances[1].id}`))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.CLOUD_LINK_CLICKED
    });

    (sendEventTelemetry as jest.Mock).mockRestore()
  })

  it('should call proper telemetry on copy host:port', async () => {
    const sendEventTelemetryMock = jest.fn();

    (sendEventTelemetry as jest.Mock).mockImplementation(() => sendEventTelemetryMock)
    render(<DatabasesListWrapper {...instance(mockedProps)} />)

    await act(() => {
      const copyHostPortButtons = screen.getAllByLabelText(/Copy host:port/i)
      fireEvent.click(copyHostPortButtons[0])
    })

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.CONFIG_DATABASES_HOST_PORT_COPIED,
      eventData: {
        databaseId: 'e37cc441-a4f2-402c-8bdb-fc2413cbbaff'
      }
    });

    (sendEventTelemetry as jest.Mock).mockRestore()
  })

  it('should call proper telemetry on open database', async () => {
    const sendEventTelemetryMock = jest.fn();

    (sendEventTelemetry as jest.Mock).mockImplementation(() => sendEventTelemetryMock)
    render(<DatabasesListWrapper {...instance(mockedProps)} />)

    await act(() => {
      fireEvent.click(screen.getByTestId('instance-name-e37cc441-a4f2-402c-8bdb-fc2413cbbaff'))
    })

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.CONFIG_DATABASES_OPEN_DATABASE,
      eventData: {
        databaseId: 'e37cc441-a4f2-402c-8bdb-fc2413cbbaff',
        provider: 'provider',
        RediSearch: {
          loaded: false
        },
        RedisAI: {
          loaded: false
        },
        RedisBloom: {
          loaded: false
        },
        RedisGears: {
          loaded: false
        },
        RedisGraph: {
          loaded: false
        },
        RedisJSON: {
          loaded: false
        },
        RedisTimeSeries: {
          loaded: false
        },
        'Triggers and Functions': {
          loaded: false
        },
        customModules: []
      }
    });

    (sendEventTelemetry as jest.Mock).mockRestore()
  })

  it('should call proper telemetry on delete database', async () => {
    const sendEventTelemetryMock = jest.fn();

    (sendEventTelemetry as jest.Mock).mockImplementation(() => sendEventTelemetryMock)
    render(<DatabasesListWrapper {...instance(mockedProps)} />)

    await act(() => {
      fireEvent.click(screen.getByTestId('delete-instance-a0db1bc8-a353-4c43-a856-b72f4811d2d4-icon'))
    })

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.CONFIG_DATABASES_SINGLE_DATABASE_DELETE_CLICKED,
      eventData: {
        databaseId: 'a0db1bc8-a353-4c43-a856-b72f4811d2d4'
      }
    });

    (sendEventTelemetry as jest.Mock).mockRestore()
  })

  it('should call proper telemetry on edit database', async () => {
    const sendEventTelemetryMock = jest.fn();

    (sendEventTelemetry as jest.Mock).mockImplementation(() => sendEventTelemetryMock)
    render(<DatabasesListWrapper {...instance(mockedProps)} onEditInstance={() => {}} />)

    await act(() => {
      fireEvent.click(screen.getByTestId('edit-instance-a0db1bc8-a353-4c43-a856-b72f4811d2d4'))
    })

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.CONFIG_DATABASES_DATABASE_EDIT_CLICKED,
      eventData: {
        databaseId: 'a0db1bc8-a353-4c43-a856-b72f4811d2d4'
      }
    });

    (sendEventTelemetry as jest.Mock).mockRestore()
  })

  it('should call proper telemetry on list sort', async () => {
    const sendEventTelemetryMock = jest.fn();

    (sendEventTelemetry as jest.Mock).mockImplementation(() => sendEventTelemetryMock)
    render(<DatabasesListWrapper {...instance(mockedProps)} onEditInstance={() => {}} />)

    await act(() => {
      fireEvent.click(screen.getByTestId('onTableChange-btn'))
    })

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.CONFIG_DATABASES_DATABASE_LIST_SORTED,
      eventData: { field: 'name', direction: 'asc' }
    });

    (sendEventTelemetry as jest.Mock).mockRestore()
  })
})
