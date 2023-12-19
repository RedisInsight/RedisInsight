import { EuiBasicTableColumn } from '@elastic/eui'
import React from 'react'
import { ConnectionType, Instance } from 'uiSrc/slices/interfaces'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import ItemList, { Props } from './ItemList'

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn()
}))

const columnsMock: EuiBasicTableColumn<Instance>[] = [
  {
    field: 'subscriptionId',
    className: 'column_subscriptionId',
    name: 'Subscription ID',
    dataType: 'string',
    sortable: true,
    width: '170px',
    truncateText: true
  }
]

const columnVariationsMock: EuiBasicTableColumn<Instance>[][] = [columnsMock, columnsMock]

const mockedProps: Props<Instance> = {
  loading: false,
  data: [
    {
      id: 'e37cc441-a4f2-402c-8bdb-fc2413cbbaff',
      host: 'localhost',
      port: 6379,
      name: 'localhost',
      username: null,
      password: null,
      connectionType: ConnectionType.Standalone,
      nameFromProvider: null,
      modules: [],
      version: null,
      lastConnection: new Date('2021-04-22T09:03:56.917Z')
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
      modules: [],
      version: null,
      tls: true
    }
  ],
  width: 0,
  dialogIsOpen: false,
  editedInstance: null,
  columnVariations: columnVariationsMock,
  onDelete: () => {},
  onExport: () => {},
  onWheel: () => {},
  onTableChange: () => {},
  sort: {
    field: 'subscriptionId',
    direction: 'asc'
  }
}

describe('ItemList', () => {
  it('should render', () => {
    expect(render(<ItemList {...mockedProps} />)).toBeTruthy()
  })

  it('should call onDelete when Delete buttons are clicked', async () => {
    const onDelete = jest.fn()
    render(<ItemList {...mockedProps} onDelete={onDelete} />)

    // select items to be deleted
    fireEvent.click(screen.getAllByLabelText(/Select all rows/i)[0])

    // click delete button
    const deleteButton = await screen.findByText('Delete')
    fireEvent.click(deleteButton)

    // confirm delete
    const deleteButtons = await screen.findAllByText('Delete')
    fireEvent.click(deleteButtons[1])

    expect(onDelete).toBeCalledTimes(1)
  })

  it('should display delete messaging when delete button is clicked', async () => {
    render(<ItemList {...mockedProps} />)

    // select items to be deleted
    fireEvent.click(screen.getAllByLabelText(/Select all rows/i)[0])

    // click delete button
    const deleteButton = await screen.findByText('Delete')
    fireEvent.click(deleteButton)

    expect(screen.getByText(/deleted/i)).toBeInTheDocument()
  })

  it('should call onExport when Export buttons are clicked', async () => {
    const onExport = jest.fn()
    render(<ItemList {...mockedProps} onExport={onExport} />)

    // select items to be exported
    fireEvent.click(screen.getAllByLabelText(/Select all rows/i)[0])

    // click export button
    const exportButton = await screen.findByText('Export')
    fireEvent.click(exportButton)

    // confirm export
    const exportButtons = await screen.findAllByText('Export')
    fireEvent.click(exportButtons[1])

    expect(onExport).toBeCalledTimes(1)
  })

  it('should display export messaging when export button is clicked', async () => {
    render(<ItemList {...mockedProps} />)

    // select items to be exported
    fireEvent.click(screen.getAllByLabelText(/Select all rows/i)[0])

    // click export button
    const exportButton = await screen.findByText('Export')
    fireEvent.click(exportButton)

    expect(screen.getByText(/exported/i)).toBeInTheDocument()
  })
})
