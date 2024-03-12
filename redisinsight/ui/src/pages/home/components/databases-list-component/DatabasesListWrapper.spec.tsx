import React from 'react'
import { instance, mock } from 'ts-mockito'
import { EuiInMemoryTable } from '@elastic/eui'
import { useSelector } from 'react-redux'

import { render, screen, fireEvent, act } from 'uiSrc/utils/test-utils'
import { mswServer } from 'uiSrc/mocks/server'
import { ConnectionType } from 'uiSrc/slices/interfaces'
import { RootState, store } from 'uiSrc/slices/store'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { errorHandlers } from 'uiSrc/mocks/res/responseComposition'
import DatabasesListWrapper, { Props } from './DatabasesListWrapper'
import DatabasesList, { Props as DatabasesListProps } from './databases-list/DatabasesList'

const mockedProps = mock<Props>()

jest.mock('./databases-list/DatabasesList', () => ({
  __esModule: true,
  namedExport: jest.fn(),
  default: jest.fn(),
}))

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('file-saver', () => ({
  saveAs: jest.fn()
}))

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn()
}))

const mockInstances = [
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
    lastConnection: new Date('2021-04-22T09:03:56.917Z'),
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
    lastConnection: null,
    tls: {
      verifyServerCert: true,
      caCertId: '70b95d32-c19d-4311-bb24-e684af12cf15',
      clientCertPairId: '70b95d32-c19d-4311-b23b24-e684af12cf15',
    },
    cloudDetails: {}
  },
]

const mockDatabasesList = (props: DatabasesListProps) => (
  <div>
    <button type="button" onClick={() => props.onDelete(['1'] as any)} data-testid="onDelete-btn">onDelete</button>
    <button type="button" onClick={() => props.onExport(['e37cc441-a4f2-402c-8bdb-fc2413cbbaff'] as any, true)} data-testid="onExport-btn">onExport</button>
    <div className="databaseList">
      <EuiInMemoryTable
        isSelectable
        items={mockInstances as any}
        itemId="id"
        loading={false}
        columns={props.columns}
        data-testid="table"
      />
    </div>
  </div>
)

beforeEach(() => {
  const state: RootState = store.getState();

  (useSelector as jest.Mock).mockImplementation((callback: (arg0: RootState) => RootState) => callback({
    ...state,
    analytics: {
      ...state.analytics
    },
    connections: {
      ...state.connections,
      instances: mockInstances as any,
    }
  }))
})

describe('DatabasesListWrapper', () => {
  it('should render', () => {
    expect(
      render(<DatabasesListWrapper {...instance(mockedProps)} />)
    ).toBeTruthy()
  })

  it('should call onDelete', () => {
    (DatabasesList as jest.Mock).mockImplementation(mockDatabasesList)

    const component = render(<DatabasesListWrapper {...instance(mockedProps)} />)
    fireEvent.click(screen.getByTestId('onDelete-btn'))
    expect(component).toBeTruthy()
  })

  it('should show indicator for a new connection', () => {
    (DatabasesList as jest.Mock).mockImplementation(mockDatabasesList)

    const { queryByTestId } = render(<DatabasesListWrapper {...instance(mockedProps)} />)

    const dbIdWithNewIndicator = mockInstances.find(({ new: newState }) => newState)?.id ?? ''
    const dbIdWithoutNewIndicator = mockInstances.find(({ new: newState }) => !newState)?.id ?? ''

    expect(queryByTestId(`database-status-new-${dbIdWithNewIndicator}`)).toBeInTheDocument()
    expect(queryByTestId(`database-status-new-${dbIdWithoutNewIndicator}`)).not.toBeInTheDocument()
  })

  it('should call proper telemetry on success export', async () => {
    (DatabasesList as jest.Mock).mockImplementation(mockDatabasesList)

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
    })
  })

  it('should call proper telemetry on fail export', async () => {
    (DatabasesList as jest.Mock).mockImplementation(mockDatabasesList)
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

  it('should show link to cloud console', () => {
    (DatabasesList as jest.Mock).mockImplementation(mockDatabasesList)
    render(<DatabasesListWrapper {...instance(mockedProps)} />)

    expect(screen.queryByTestId(`cloud-link-${mockInstances[0].id}`)).not.toBeInTheDocument()
    expect(screen.getByTestId(`cloud-link-${mockInstances[1].id}`)).toBeInTheDocument()
  })

  it('should call proper telemetry on click cloud console ling', () => {
    (DatabasesList as jest.Mock).mockImplementation(mockDatabasesList)
    const sendEventTelemetryMock = jest.fn();

    (sendEventTelemetry as jest.Mock).mockImplementation(() => sendEventTelemetryMock)
    render(<DatabasesListWrapper {...instance(mockedProps)} />)

    fireEvent.click(screen.getByTestId(`cloud-link-${mockInstances[1].id}`))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.CLOUD_LINK_CLICKED,
    });

    (sendEventTelemetry as jest.Mock).mockRestore()
  })
})
