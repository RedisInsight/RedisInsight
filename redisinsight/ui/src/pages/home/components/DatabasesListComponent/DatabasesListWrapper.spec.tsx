import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'
import { EuiInMemoryTable } from '@elastic/eui'

import { first } from 'lodash'
import { ConnectionType } from 'uiSrc/slices/interfaces'
import DatabasesListWrapper, { Props } from './DatabasesListWrapper'
import DatabasesList, { Props as DatabasesListProps } from './DatabasesList/DatabasesList'

const mockedProps = mock<Props>()

jest.mock('./DatabasesList/DatabasesList', () => ({
  __esModule: true,
  namedExport: jest.fn(),
  default: jest.fn(),
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
  },
]

const mockDatabasesList = (props: DatabasesListProps) => (
  <div>
    <button type="button" onClick={() => props.onDelete(['1'])} data-testid="onDelete-btn">onDelete</button>
    <div className="databaseList">
      <EuiInMemoryTable
        isSelectable
        items={mockInstances}
        itemId="id"
        loading={false}
        columns={first(props.columnVariations)}
        data-testid="table"
      />
    </div>
  </div>
)

describe('DatabasesListWrapper', () => {
  beforeAll(() => {
    DatabasesList.mockImplementation(mockDatabasesList)
  })
  it('should render', () => {
    expect(
      render(<DatabasesListWrapper {...instance(mockedProps)} />)
    ).toBeTruthy()
  })

  it('should call onDelete', () => {
    const component = render(<DatabasesListWrapper {...instance(mockedProps)} />)
    fireEvent.click(screen.getByTestId('onDelete-btn'))
    expect(component).toBeTruthy()
  })
})
