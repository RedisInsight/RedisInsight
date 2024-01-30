import { EuiTableFieldDataColumnType } from '@elastic/eui'
import React from 'react'
import { instance, mock } from 'ts-mockito'
import { Instance } from 'uiSrc/slices/interfaces'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import DatabasesList, { Props } from './DatabasesList'

const mockedProps = mock<Props>()

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  instancesSelector: jest.fn().mockReturnValue({
    loading: false,
    error: '',
    data: [
      {
        id: 'e37cc441-a4f2-402c-8bdb-fc2413cbbaff',
        host: 'localhost',
        port: 6379,
        name: 'localhost',
        username: null,
        password: null,
        connectionType: 'standalone',
        nameFromProvider: null,
        modules: [],
        uoeu: 123,
        lastConnection: new Date('2021-04-22T09:03:56.917Z'),
      },
      {
        id: 'a0db1bc8-a353-4c43-a856-b72f4811d2d4',
        host: 'localhost',
        port: 12000,
        name: 'oea123123',
        username: null,
        password: null,
        connectionType: 'standalone',
        nameFromProvider: null,
        modules: [],
        tls: {
          verifyServerCert: true,
          caCertId: '70b95d32-c19d-4311-bb24-e684af12cf15',
          clientCertPairId: '70b95d32-c19d-4311-b23b24-e684af12cf15',
        },
      }
    ]
  })
}))

const columnsMock: EuiTableFieldDataColumnType<Instance>[] = [
  {
    field: 'subscriptionId',
    className: 'column_subscriptionId',
    name: 'Subscription ID',
    dataType: 'string',
    sortable: true,
    width: '170px',
    truncateText: true,
  },
  {
    field: 'lastConnection',
    className: 'column_subscriptionId',
    name: 'Last connection',
    dataType: 'string',
    sortable: true,
    width: '170px',
    truncateText: true,
  },
]

describe('DatabasesList', () => {
  it('should render', () => {
    expect(
      render(
        <DatabasesList
          {...instance(mockedProps)}
          columns={columnsMock}
        />
      )
    ).toBeTruthy()
  })

  it('should call onExport and send telemetry on click export btn', () => {
    const sendEventTelemetryMock = jest.fn()
    const onExport = jest.fn();

    (sendEventTelemetry as jest.Mock).mockImplementation(() => sendEventTelemetryMock)

    const { container } = render(
      <DatabasesList
        {...instance(mockedProps)}
        onExport={onExport}
        columns={columnsMock}
      />
    )

    fireEvent.click(
      container.querySelector('[data-test-subj="checkboxSelectAll"]') as Element
    )

    fireEvent.click(screen.getByTestId('export-btn'))
    fireEvent.click(screen.getByTestId('export-selected-dbs'))

    expect(onExport).toBeCalled()
    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.CONFIG_DATABASES_REDIS_EXPORT_CLICKED
    })
  })
})
