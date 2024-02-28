import React from 'react'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import { EuiInMemoryTable } from '@elastic/eui'

import RedisCloudDatabasesPage from './RedisCloudDatabasesPage'
import RedisCloudDatabases from './RedisCloudDatabases'
import { Props as RedisCloudDatabasesProps } from './RedisCloudDatabases/RedisCloudDatabases'

jest.mock('./RedisCloudDatabases', () => ({
  __esModule: true,
  namedExport: jest.fn(),
  default: jest.fn(),
}))

const mockRedisCloudDatabases = (props: RedisCloudDatabasesProps) => (
  <div>
    <button type="button" onClick={() => props.onClose()} data-testid="close-btn">onClose</button>
    <button type="button" onClick={() => props.onBack()} data-testid="back-btn">onBack</button>
    <button type="button" onClick={() => props.onSubmit([])} data-testid="submit-btn">onSubmit</button>
    <div className="itemList">
      <EuiInMemoryTable
        isSelectable
        items={[]}
        itemId="id"
        loading={false}
        columns={props.columns}
        data-testid="table"
      />
    </div>
  </div>
)

/**
 * RedisCloudDatabasesPage tests
 *
 * @group component
 */
describe('RedisCloudDatabasesPage', () => {
  beforeAll(() => {
    RedisCloudDatabases.mockImplementation(mockRedisCloudDatabases)
  })

  it('should render', () => {
    expect(render(<RedisCloudDatabasesPage />)).toBeTruthy()
  })

  it('should call onClose', () => {
    const component = render(<RedisCloudDatabasesPage />)
    fireEvent.click(screen.getByTestId('close-btn'))
    expect(component).toBeTruthy()
  })

  it('should call onBack', () => {
    const component = render(<RedisCloudDatabasesPage />)
    fireEvent.click(screen.getByTestId('back-btn'))
    expect(component).toBeTruthy()
  })

  it('should call onSubmit', () => {
    const component = render(<RedisCloudDatabasesPage />)
    fireEvent.click(screen.getByTestId('submit-btn'))
    expect(component).toBeTruthy()
  })
})
